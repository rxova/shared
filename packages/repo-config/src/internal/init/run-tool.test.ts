import { describe, expect, it } from "vitest";
import { runTool } from "@/internal/init/run-tool";

describe("runTool", () => {
  it("returns stdout, trimmed", () => {
    expect(runTool(process.execPath, ["-e", "console.log('  hi  ')"])).toBe("hi");
  });

  it("throws when the program fails", () => {
    expect(() => runTool(process.execPath, ["-e", "process.exit(3)"])).toThrow();
  });
});
