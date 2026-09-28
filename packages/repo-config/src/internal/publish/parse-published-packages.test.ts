import { describe, expect, it } from "vitest";
import { parsePublishedPackages } from "@/internal/publish/parse-published-packages";

describe("parsePublishedPackages", () => {
  it("reads name and version pairs", () => {
    expect(parsePublishedPackages('[{"name":"a","version":"1.0.0","extra":1}]')).toEqual([
      { name: "a", version: "1.0.0" },
    ]);
  });

  it.each(["", "[]", "{}"])("refuses an empty or non-array value: %j", (value) => {
    expect(() => parsePublishedPackages(value)).toThrow("lists no published package");
  });

  it.each(["[1]", '[{"name":"a"}]', '[{"name":"","version":"1"}]', '[{"name":"a","version":""}]'])(
    "refuses a malformed entry: %s",
    (value) => {
      expect(() => parsePublishedPackages(value)).toThrow("is not { name, version }");
    },
  );
});
