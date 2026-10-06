import { afterEach, describe, expect, it, vi } from "vitest";
import { runSteps } from "@/verify/run-steps";

const step = (name: string, command = `echo ${name}`) => ({ name, command });

describe("runSteps", () => {
  const out = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  const err = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  afterEach(() => {
    out.mockClear();
    err.mockClear();
  });

  it("runs every step in order and passes", () => {
    const ran: string[] = [];
    const code = runSteps([step("first", "echo one"), step("second", "echo two")], {
      run: (command) => void ran.push(command),
    });

    expect(code).toBe(0);
    expect(ran).toEqual(["echo one", "echo two"]);
    expect(out).toHaveBeenCalledWith("\nverify: all checks passed\n");
  });

  it("stops at the first failure and names the step and its command", () => {
    const ran: string[] = [];
    const code = runSteps([step("first"), step("second", "boom"), step("third")], {
      run: (command) => {
        ran.push(command);
        if (command === "boom") throw new Error("exit 1");
      },
    });

    expect(code).toBe(1);
    expect(ran).toEqual(["echo first", "boom"]);
    expect(err).toHaveBeenCalledWith("\nverify: second failed — `boom`\n");
    expect(out).not.toHaveBeenCalledWith("\nverify: all checks passed\n");
  });

  it("with keepGoing runs every step in order and lists each failure at the end", () => {
    const ran: string[] = [];
    const code = runSteps([step("lint", "bad lint"), step("build"), step("dedupe", "bad dedupe")], {
      run: (command) => {
        ran.push(command);
        if (command.startsWith("bad")) throw new Error("exit 1");
      },
      env: {},
      keepGoing: true,
    });

    expect(code).toBe(1);
    expect(ran).toEqual(["bad lint", "echo build", "bad dedupe"]);
    const summary = err.mock.calls.map(([line]) => String(line));
    expect(summary.slice(-3)).toEqual([
      "\nverify: 2 of 3 step(s) failed\n",
      "verify: failed: lint — `bad lint`\n",
      "verify: failed: dedupe — `bad dedupe`\n",
    ]);
    expect(out).not.toHaveBeenCalledWith("\nverify: all checks passed\n");
  });

  it("with keepGoing passes when nothing fails, and still skips release-only steps", () => {
    const ran: string[] = [];
    const steps = [
      { name: "audit", command: "audit", skipOnRelease: true },
      { name: "lint", command: "lint" },
    ];
    const code = runSteps(steps, {
      run: (command) => void ran.push(command),
      env: { GITHUB_HEAD_REF: "changeset-release/main" },
      keepGoing: true,
    });
    expect(code).toBe(0);
    expect(ran).toEqual(["lint"]);
    expect(err).not.toHaveBeenCalled();
    expect(out).toHaveBeenCalledWith("\nverify: all checks passed\n");
  });

  it("announces each step with its position before running it", () => {
    runSteps([step("lint"), step("format")], { run: () => {}, env: {} });
    expect(out).toHaveBeenCalledWith("\nverify: [1/2] lint\n");
    expect(out).toHaveBeenCalledWith("\nverify: [2/2] format\n");
  });

  it("skips the steps marked skipOnRelease on the release pull request only", () => {
    const ran: string[] = [];
    const steps = [
      { name: "audit", command: "audit", skipOnRelease: true },
      { name: "lint", command: "lint" },
    ];
    const run = (command: string) => void ran.push(command);
    runSteps(steps, { run, env: { GITHUB_HEAD_REF: "changeset-release/main" } });
    expect(ran).toEqual(["lint"]);
    expect(out).toHaveBeenCalledWith("\nverify: [1/2] audit: skipped on the release branch\n");
    runSteps(steps, { run, env: {} });
    expect(ran).toEqual(["lint", "audit", "lint"]);
  });

  it("folds each step into a log group on GitHub Actions", () => {
    runSteps([step("lint")], { run: () => {}, env: { GITHUB_ACTIONS: "true" } });
    expect(out).toHaveBeenCalledWith("::group::verify: [1/1] lint\n");
    expect(out).toHaveBeenCalledWith("::endgroup::\n");
  });

  it("passes trivially on an empty list, and runs a real command by default", () => {
    expect(runSteps([], { run: () => {} })).toBe(0);
    expect(runSteps([step("node", `"${process.execPath}" -e "0"`)])).toBe(0);
  });
});
