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

  it("announces each step with its position before running it", () => {
    runSteps([step("lint"), step("format")], { run: () => {} });
    expect(out).toHaveBeenCalledWith("\nverify: [1/2] lint\n");
    expect(out).toHaveBeenCalledWith("\nverify: [2/2] format\n");
  });

  it("passes trivially on an empty list, and runs a real command by default", () => {
    expect(runSteps([], { run: () => {} })).toBe(0);
    expect(runSteps([step("node", `"${process.execPath}" -e "0"`)])).toBe(0);
  });
});
