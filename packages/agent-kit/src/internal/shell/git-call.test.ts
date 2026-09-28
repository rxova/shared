import { describe, expect, it } from "vitest";
import { gitCall } from "@/internal/shell/git-call";

describe("gitCall", () => {
  it("reads the assignments, -c values, subcommand and arguments", () => {
    expect(
      gitCall([
        "HUSKY=0",
        "git",
        "-C",
        "repo",
        "-c",
        "a.b=1",
        "-cx.y=2",
        "--git-dir",
        "g",
        "commit",
        "-m",
        "x",
      ]),
    ).toEqual({
      env: ["HUSKY=0"],
      config: ["a.b=1", "x.y=2"],
      subcommand: "commit",
      args: ["-m", "x"],
    });
  });

  it("knows git by its program name, wherever it lives", () => {
    expect(gitCall(["/usr/bin/git", "push"])?.subcommand).toBe("push");
  });

  it("is undefined for another program, or nothing at all", () => {
    expect(gitCall(["gitx", "commit"])).toBeUndefined();
    expect(gitCall([])).toBeUndefined();
  });

  it("has an empty subcommand when git is run bare", () => {
    expect(gitCall(["git", "--version"])).toEqual({
      env: [],
      config: [],
      subcommand: "",
      args: [],
    });
    expect(gitCall(["git", "-c"])?.config).toEqual([""]);
  });
});
