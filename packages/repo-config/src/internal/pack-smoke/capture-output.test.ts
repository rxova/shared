import { describe, expect, it } from "vitest";
import { captureOutput } from "@/internal/pack-smoke/capture-output";

describe("captureOutput", () => {
  const node = (code: string) => captureOutput(process.execPath, ["-e", code], process.cwd());

  it("returns stdout and stderr together", () => {
    expect(node('process.stdout.write("out;"); process.stderr.write("err")')).toBe("out;err");
  });

  it("throws with the output on a non-zero exit", () => {
    expect(() => node('console.error("bad"); process.exit(2)')).toThrow(/exited with 2:\nbad/);
  });
});
