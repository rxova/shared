import { describe, expect, it } from "vitest";
import { wantsPlan } from "@/verify/wants-plan";

describe("wantsPlan", () => {
  it("is true for --plan alone and false without it", () => {
    expect(wantsPlan(["--plan"])).toBe(true);
    expect(wantsPlan(["--keep-going"])).toBe(false);
  });

  it("refuses a value or another flag beside it", () => {
    expect(() => wantsPlan(["--plan=1"])).toThrow("--plan takes no value");
    expect(() => wantsPlan(["--plan", "--only", "lint"])).toThrow("--plan takes no other flag");
  });
});
