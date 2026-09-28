import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { targetDir } from "@/internal/install/target-dir";

describe("targetDir", () => {
  it("is .claude under the home, or under the project with --project", () => {
    expect(targetDir(false, { home: "/home/me", cwd: "/work/app" })).toBe(
      join("/home/me", ".claude"),
    );
    expect(targetDir(true, { home: "/home/me", cwd: "/work/app" })).toBe(
      join("/work/app", ".claude"),
    );
  });

  it("refuses an empty or relative base instead of installing where it runs", () => {
    expect(() => targetDir(false, { home: "", cwd: "/work" })).toThrow("HOME is empty");
    expect(() => targetDir(true, { home: "/home/me", cwd: "rel" })).toThrow("not an absolute path");
  });
});
