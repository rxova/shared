import { describe, expect, it } from "vitest";
import { readStringRecord } from "@/internal/config/read-string-record";

describe("readStringRecord", () => {
  it("reads an object of strings or nothing", () => {
    expect(readStringRecord({ a: { react: "^19" } }, "a", "p")).toEqual({ react: "^19" });
    expect(readStringRecord({}, "a", "p")).toBeUndefined();
  });

  it.each([[["x"]], [{ react: 19 }], [{ react: "" }]])("refuses %j", (value) => {
    expect(() => readStringRecord({ a: value }, "a", "p")).toThrow(
      "p.a must be an object of non-empty strings",
    );
  });
});
