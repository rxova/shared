import { describe, expect, it } from "vitest";
import { revisionRange } from "@/internal/scope/revision-range";

describe("revisionRange", () => {
  it("joins the two ends with three dots", () => {
    expect(revisionRange("aaa", "HEAD")).toBe("aaa...HEAD");
  });

  it.each([
    ["--upload-pack=touch x", "HEAD"],
    ["HEAD", "-v"],
  ])("refuses an end that git would read as an option (%s, %s)", (base, head) => {
    expect(() => revisionRange(base, head)).toThrow("starts with a dash");
  });
});
