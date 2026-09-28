import { describe, expect, it } from "vitest";
import { mdxToMarkdown } from "@/markdown/mdx-to-markdown";

const origin = "https://rxova.org";

describe("mdxToMarkdown", () => {
  it("strips MDX imports but never an import inside a fence", () => {
    const source = [
      "import { Tabs } from '@astrojs/starlight/components';",
      "",
      "Text.",
      "",
      "```ts",
      "import { x } from 'y';",
      "```",
    ].join("\n");
    expect(mdxToMarkdown(source, { origin })).toBe(
      ["Text.", "", "```ts", "import { x } from 'y';", "```"].join("\n"),
    );
  });

  it("flattens tabs into labelled sections and collapses the blank lines left behind", () => {
    const source = [
      "<Tabs>",
      '<TabItem label="pnpm">',
      "",
      "```sh",
      "pnpm add x",
      "```",
      "",
      "</TabItem>",
      "</Tabs>",
      "",
      "After.",
    ].join("\n");
    expect(mdxToMarkdown(source, { origin })).toBe(
      ["#### pnpm", "", "```sh", "pnpm add x", "```", "", "After."].join("\n"),
    );
  });

  it("resolves doc-relative links against fromRoute and absolutizes root links under the base", () => {
    const source = "See [a](../rules/x.md#y) and [b](/learn/) and ![c](/c.png).";
    expect(mdxToMarkdown(source, { origin, base: "/pkg/", fromRoute: "/learn/intro.md" })).toBe(
      "See [a](https://rxova.org/pkg/rules/x.md#y) and [b](https://rxova.org/pkg/learn/) and ![c](https://rxova.org/pkg/c.png).",
    );
  });

  it("resolves from the home twin by default", () => {
    expect(mdxToMarkdown("[a](./learn/x.md)", { origin })).toBe(
      "[a](https://rxova.org/learn/x.md)",
    );
  });

  it("takes extra components and headings", () => {
    const source = [
      '<Details summary="x">',
      '<Box title="Why">',
      "body",
      "</Box>",
      "</Details>",
    ].join("\n");
    expect(
      mdxToMarkdown(source, { origin, components: { unwrap: ["Details"], headings: { Box: 2 } } }),
    ).toBe(["## Why", "", "body"].join("\n"));
  });

  it("runs expand passes first, each seeing the fences the one before emitted", () => {
    const source = "<Live code={`<X />`} />\n\n```tsx live\n<Y />\n```";
    const out = mdxToMarkdown(source, {
      origin,
      expand: [
        (chunk) => chunk.replace(/<Live code=\{`([^`]*)`\} \/>/g, "```tsx\n$1\n```"),
        (chunk) => chunk.replace("<X />", "never"),
      ],
      fenceOpen: (line) => line.replace(/\s+live$/, ""),
    });
    expect(out).toBe("```tsx\n<X />\n```\n\n```tsx\n<Y />\n```");
  });
});
