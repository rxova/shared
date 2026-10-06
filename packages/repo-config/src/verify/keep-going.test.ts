import { describe, expect, it } from "vitest";
import { keepGoing } from "@/verify/keep-going";

describe("keepGoing", () => {
  it("is off without the flag", () => {
    expect(keepGoing([])).toBe(false);
    expect(keepGoing(["--only", "lint"])).toBe(false);
  });

  it("is on with the flag, wherever it sits beside --only", () => {
    expect(keepGoing(["--keep-going"])).toBe(true);
    expect(keepGoing(["--only", "lint", "--keep-going"])).toBe(true);
    expect(keepGoing(["--keep-going", "--only=lint"])).toBe(true);
  });

  it("refuses a value rather than guessing what it means", () => {
    expect(() => keepGoing(["--keep-going=false"])).toThrow("--keep-going takes no value");
  });
});
