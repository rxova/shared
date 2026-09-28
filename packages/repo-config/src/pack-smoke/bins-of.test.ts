import { describe, expect, it } from "vitest";
import { binsOf } from "@/pack-smoke/bins-of";

describe("binsOf", () => {
  it("names a string bin after the package, scope dropped", () => {
    expect(binsOf({ name: "@scope/example", version: "1.0.0", bin: "./dist/cli.js" })).toEqual([
      "example",
    ]);
  });

  it("lists every key of a bin map", () => {
    expect(binsOf({ name: "x", version: "1.0.0", bin: { a: "./a.js", b: "./b.js" } })).toEqual([
      "a",
      "b",
    ]);
  });

  it("is empty for a library with no bin, and empty-named for a nameless string bin", () => {
    expect(binsOf({ name: "x", version: "1.0.0" })).toEqual([]);
    expect(binsOf({ bin: "./cli.js" })).toEqual([""]);
  });
});
