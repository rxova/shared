import { describe, expect, it } from "vitest";
import { isUntwinned } from "@/internal/check/is-untwinned";

describe("isUntwinned", () => {
  it("matches exact paths and directory prefixes", () => {
    const untwinned = ["404.html", "playground/"];
    expect(isUntwinned("404.html", untwinned)).toBe(true);
    expect(isUntwinned("playground/a/index.html", untwinned)).toBe(true);
    expect(isUntwinned("rules/x/index.html", untwinned)).toBe(false);
    expect(isUntwinned("404.html/x", untwinned)).toBe(false);
  });
});
