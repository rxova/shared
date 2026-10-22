import { describe, expect, it } from "vitest";
import { bannedHits } from "@/internal/bundle/banned-hits";

describe("bannedHits", () => {
  it("reports a free reference with its line", () => {
    expect(
      bannedHits("dist/index.js", "const a = 1;\nreturn process.env.NODE_ENV;\n", ["process"]),
    ).toEqual([{ file: "dist/index.js", line: 2, name: "process" }]);
  });

  it("ignores a property read, a longer name and a comment", () => {
    const code = [
      "// process.env.NODE_ENV is spelled out above",
      "globalThis.process?.env;",
      "value?.process;",
      "const subprocess = processItem(x);",
    ].join("\n");
    expect(bannedHits("dist/index.js", code, ["process"])).toEqual([]);
  });

  it("reports every banned name", () => {
    expect(bannedHits("c.js", "require(x); process;", ["process", "require"])).toEqual([
      { file: "c.js", line: 1, name: "process" },
      { file: "c.js", line: 1, name: "require" },
    ]);
  });

  it("treats a name with regex characters literally, not as a pattern", () => {
    expect(bannedHits("c.js", "axb;", ["a.b"])).toEqual([]);
  });
});
