import { describe, expect, it } from "vitest";
import { entryChunks } from "@/internal/bundle/entry-chunks";

const reader =
  (files: Record<string, string>) =>
  (file: string): string | undefined =>
    files[file.replaceAll("\\", "/")];

describe("entryChunks", () => {
  it("follows relative imports and re-exports, once each", () => {
    const read = reader({
      "/p/dist/index.js": [
        `import { a } from "./chunk-a.js";`,
        `export { b } from "./chunk-b.js";`,
        `import "./chunk-a.js";`,
      ].join("\n"),
      "/p/dist/chunk-a.js": `export const a = 1;`,
      "/p/dist/chunk-b.js": `import { a } from "./chunk-a.js";`,
    });
    expect(entryChunks("/p", "dist/index.js", read)).toEqual([
      "dist/index.js",
      "dist/chunk-a.js",
      "dist/chunk-b.js",
    ]);
  });

  it("follows a dynamic import and a parent-relative one", () => {
    const read = reader({
      "/p/dist/a/index.js": `await import("../shared.js");`,
      "/p/dist/shared.js": ``,
    });
    expect(entryChunks("/p", "dist/a/index.js", read)).toEqual([
      "dist/a/index.js",
      "dist/shared.js",
    ]);
  });

  it("resolves specifiers with posix rules, whatever the host separator is", () => {
    const read = reader({
      "/p/dist/index.js": `import "./a/one.js";`,
      "/p/dist/a/one.js": `import "../b/two.js";`,
      "/p/dist/b/two.js": ``,
    });
    expect(entryChunks("/p", "./dist/index.js", read)).toEqual([
      "dist/index.js",
      "dist/a/one.js",
      "dist/b/two.js",
    ]);
  });

  it("leaves bare specifiers and unreadable files alone", () => {
    const read = reader({ "/p/dist/index.js": `import "react";\nimport "./gone.js";` });
    expect(entryChunks("/p", "dist/index.js", read)).toEqual(["dist/index.js", "dist/gone.js"]);
  });
});
