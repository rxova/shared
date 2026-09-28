import { describe, expect, it } from "vitest";
import { bash, contextWith } from "@/internal/hooks/context.fixtures";
import { noBypass } from "@/hooks/no-bypass";

const blocked = (command: string) => noBypass(bash(command), contextWith()).block;

describe("noBypass", () => {
  it.each([
    'git commit --no-verify -m "x"',
    'git commit -nm "x"',
    "git commit -n",
    "git push --no-verify",
    "git merge --no-verify main",
    "git add . && git commit -m ok && git push --no-verify origin",
    "HUSKY=0 git commit -m x",
    "git -c core.hooksPath=/dev/null commit -m x",
    "git -c core.hookspath= push",
    "git config core.hooksPath /tmp/none",
    "git config --unset core.hooksPath",
  ])("blocks %s", (command) => {
    expect(blocked(command)).toBe(true);
  });

  it.each([
    'git commit -m "explain why --no-verify is banned"',
    "git commit -m --no-verify",
    'git commit -am "message with n"',
    "git commit -F notes-n.txt",
    "git commit -C HEAD",
    "git log -n 3",
    "git push -n",
    "git commit -- --no-verify",
    "git config --get core.hooksPath",
    "git config -l",
    "git -c user.name=x commit -m y",
    "echo --no-verify",
    "HUSKY=1 git commit -m x",
    "git commit -F - <<'EOF'\n--no-verify\nEOF",
  ])("allows %s", (command) => {
    expect(blocked(command)).toBe(false);
  });

  it("says what it stopped and what to do instead", () => {
    expect(noBypass(bash("HUSKY=0 git push"), contextWith())).toEqual({
      block: true,
      reason: expect.stringContaining("HUSKY=0") as string,
    });
    expect(noBypass(bash("git config core.hooksPath x"), contextWith())).toEqual({
      block: true,
      reason: expect.stringContaining("core.hooksPath") as string,
    });
  });

  it("ignores every tool but Bash, and a Bash call without a command", () => {
    expect(
      noBypass({ tool_name: "Write", tool_input: { command: "git commit -n" } }, contextWith())
        .block,
    ).toBe(false);
    expect(noBypass({ tool_name: "Bash", tool_input: {} }, contextWith()).block).toBe(false);
    expect(noBypass({ tool_name: "Bash" }, contextWith()).block).toBe(false);
  });
});
