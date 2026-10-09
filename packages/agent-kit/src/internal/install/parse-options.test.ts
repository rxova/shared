import { describe, expect, it } from "vitest";
import { parseOptions } from "@/internal/install/parse-options";

describe("parseOptions", () => {
  it("reads booleans, a profile, and repeatable comma lists", () => {
    expect(
      parseOptions(
        ["--project", "--profile", "full", "--add", "a,b", "--add=c", "--skip", " d , "],
        ["project", "profile", "add", "skip"],
      ),
    ).toEqual({ project: true, profile: "full", add: ["a", "b", "c"], skip: ["d"] });
  });

  it("turns a boolean off with --no-<name>", () => {
    expect(parseOptions(["--no-statusline"], ["statusline"])).toEqual({ statusline: false });
    expect(parseOptions(["--statusline"], ["statusline"])).toEqual({ statusline: true });
  });

  it("leaves out what was not given", () => {
    expect(parseOptions([], ["project", "add"])).toEqual({});
  });

  it("rejects an option the command does not take, and positional arguments", () => {
    expect(() => parseOptions(["--force"], ["project"])).toThrow("--force");
    expect(() => parseOptions(["extra"], ["project"])).toThrow();
  });
});
