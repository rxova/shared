import { describe, expect, it } from "vitest";
import { fencedSnippets } from "@/internal/docs/fenced-snippets";

describe("fencedSnippets", () => {
  it("finds the script fences with their info and opening line", () => {
    const source = [
      "# Title",
      "",
      "```ts",
      "const a = 1;",
      "```",
      "```sh",
      "pnpm i",
      "```",
      '```tsx live title="x"',
      "<A />",
      "```",
    ].join("\n");
    expect(fencedSnippets(source)).toEqual([
      { language: "ts", info: "", code: "const a = 1;\n", line: 3 },
      { language: "tsx", info: 'live title="x"', code: "<A />\n", line: 9 },
    ]);
  });

  it("does not read a json fence as js", () => {
    const source = [
      "```json",
      '{ "a": 1 }',
      "```",
      "```jsonc",
      "{}",
      "```",
      "```js",
      "a;",
      "```",
    ].join("\n");
    expect(fencedSnippets(source)).toEqual([{ language: "js", info: "", code: "a;\n", line: 7 }]);
  });
});
