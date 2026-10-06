import { describe, expect, it } from "vitest";
import { nonEmpty } from "@/internal/changeset/non-empty";

describe("nonEmpty", () => {
  it("reads an empty or missing value as undefined", () => {
    expect(nonEmpty("")).toBeUndefined();
    expect(nonEmpty(undefined)).toBeUndefined();
    expect(nonEmpty("main")).toBe("main");
  });
});
