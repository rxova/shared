import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSteps } from "@/verify/default-steps";
import { verifyCommand } from "@/verify/verify-command";

const step = (name: string, command = `echo ${name}`) => ({ name, command });

describe("verifyCommand", () => {
  const out = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  const err = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  afterEach(() => {
    out.mockClear();
    err.mockClear();
  });

  it("runs the default list when the repository names none", () => {
    const ran: string[] = [];
    const run = (command: string) => void ran.push(command);
    expect(verifyCommand([], { read: () => undefined, run })).toBe(0);
    expect(ran).toEqual(defaultSteps().map(({ command }) => command));
  });

  it("runs the list from package.json#repoConfig.verify.steps", () => {
    const ran: string[] = [];
    const read = () => JSON.stringify({ repoConfig: { verify: { steps: [step("only", "x")] } } });
    expect(verifyCommand([], { read, run: (command) => void ran.push(command) })).toBe(0);
    expect(ran).toEqual(["x"]);
  });

  it("honours --only", () => {
    const ran: string[] = [];
    const run = (command: string) => void ran.push(command);
    verifyCommand(["--only", "lint"], { read: () => undefined, run });
    expect(ran).toEqual(["pnpm lint"]);
  });

  it("honours --keep-going beside --only, in list order", () => {
    const ran: string[] = [];
    const run = (command: string) => {
      ran.push(command);
      throw new Error("exit 1");
    };
    const argv = ["--only", "dependency dedupe,lint", "--keep-going"];
    expect(verifyCommand(argv, { read: () => undefined, run })).toBe(1);
    expect(ran).toEqual(["pnpm lint", "pnpm exec turbo run //#dedupe:check"]);
  });

  it("honours --filter on the split steps beside --only", () => {
    const ran: string[] = [];
    const steps = [step("lint"), { ...step("unit tests", "turbo run test"), split: true }];
    const read = () => JSON.stringify({ repoConfig: { verify: { steps } } });
    const argv = ["--only", "lint,unit tests", "--filter", "core"];
    expect(verifyCommand(argv, { read, run: (command) => void ran.push(command) })).toBe(0);
    expect(ran).toEqual(["echo lint", "turbo run test --filter=core"]);
  });

  it("prints the plan as one line of matrix JSON and runs nothing", () => {
    const steps = [
      { ...step("format"), group: "static" },
      { ...step("unit tests", "turbo run test"), split: { max: 2 } },
      { ...step("audit"), group: "static" },
    ];
    const read = () => JSON.stringify({ repoConfig: { verify: { steps } } });
    const tasks = [{ task: "test", package: "core", cache: { status: "MISS" }, inputs: {} }];
    const dryRun = (command: string) => {
      expect(command).toBe("turbo run test");
      return JSON.stringify({ tasks });
    };
    const run = () => {
      throw new Error("--plan runs no step");
    };
    expect(verifyCommand(["--plan"], { read, run, dryRun })).toBe(0);
    expect(out).toHaveBeenCalledWith(
      `${JSON.stringify({
        include: [
          { name: "static", only: "format,audit", filter: "" },
          { name: "unit tests · core", only: "unit tests", filter: "core" },
        ],
      })}\n`,
    );
  });

  it("fails with the reason when the plan cannot be made", () => {
    const steps = [{ ...step("unit tests", "turbo run test"), split: true }];
    const read = () => JSON.stringify({ repoConfig: { verify: { steps } } });
    expect(verifyCommand(["--plan"], { read, run: () => {}, dryRun: () => "oops" })).toBe(1);
    expect(err).toHaveBeenCalledWith("verify: turbo's --dry=json output is not JSON\n");
    expect(verifyCommand(["--plan", "--keep-going"], { read, run: () => {} })).toBe(1);
  });

  it("fails with the reason when the config or the flags are wrong", () => {
    expect(verifyCommand([], { read: () => '{"repoConfig":{"verify":[]}}', run: () => {} })).toBe(
      1,
    );
    expect(err).toHaveBeenCalledWith(
      expect.stringContaining("repoConfig.verify must be an object"),
    );
    expect(verifyCommand(["--only", "nope"], { read: () => undefined, run: () => {} })).toBe(1);
    expect(verifyCommand(["--keep-going=1"], { read: () => undefined, run: () => {} })).toBe(1);
  });

  it("reads the working directory and argv by default", () => {
    // No step is named `no-such-step`, so nothing runs and the failure is the flag's.
    const argv = vi.spyOn(process, "argv", "get");
    argv.mockReturnValue(["node", "cli", "--only", "no-such-step"]);
    expect(verifyCommand()).toBe(1);
    argv.mockRestore();
  });
});
