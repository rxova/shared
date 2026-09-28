import { describe, expect, it } from "vitest";
import { parseBump } from "@/internal/changeset/parse-bump";

describe("parseBump", () => {
  it.each(["patch", "minor", "major"])("accepts %s", (bump) => {
    expect(parseBump(bump)).toBe(bump);
  });

  it("refuses anything else", () => {
    expect(() => parseBump("huge")).toThrow(
      'invalid bump "huge"; expected one of patch, minor, major',
    );
    expect(() => parseBump(undefined)).toThrow('invalid bump ""');
  });
});
