import { describe, expect, it } from "vitest";
import { readListFlag } from "@/internal/verify/read-list-flag";

describe("readListFlag", () => {
  it("is undefined without the flag", () => {
    expect(readListFlag(["--only", "a"], "--filter", "packages")).toBeUndefined();
  });

  it("reads the list in either spelling, trimmed", () => {
    expect(readListFlag(["--filter", "a, b"], "--filter", "packages")).toEqual(["a", "b"]);
    expect(readListFlag(["--filter=a,b"], "--filter", "packages")).toEqual(["a", "b"]);
  });

  it("refuses an empty list, naming what it holds", () => {
    expect(() => readListFlag(["--filter"], "--filter", "packages")).toThrow(
      "--filter needs a comma-separated list of packages",
    );
    expect(() => readListFlag(["--filter=,"], "--filter", "packages")).toThrow("packages");
  });
});
