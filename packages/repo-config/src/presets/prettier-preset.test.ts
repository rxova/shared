import { existsSync } from "node:fs";
import { isAbsolute } from "node:path";
import { format } from "prettier";
import { describe, expect, it } from "vitest";
import config from "@rxova/repo-config/prettier";

describe("the prettier preset", () => {
  it("formats with semicolons, double quotes, trailing commas and arrow parens at 100 columns", () => {
    expect(config).toMatchObject({
      semi: true,
      singleQuote: false,
      printWidth: 100,
      trailingComma: "all",
      arrowParens: "always",
    });
  });

  it("ships prettier-plugin-astro by absolute path, so consumers need not install it", () => {
    const [plugin] = config.plugins ?? [];
    expect(typeof plugin).toBe("string");
    expect(isAbsolute(plugin as string)).toBe(true);
    expect(existsSync(plugin as string)).toBe(true);
    expect(config.overrides).toEqual([{ files: "*.astro", options: { parser: "astro" } }]);
  });

  it("formats TypeScript and Astro sources", async () => {
    await expect(
      format("const f = x => ({ a: 'b' })", { ...config, parser: "typescript" }),
    ).resolves.toBe('const f = (x) => ({ a: "b" });\n');
    const astro = await format("---\nconst a = 'b'\n---\n<p>{a}</p>\n", {
      ...config,
      filepath: "page.astro",
    });
    expect(astro).toBe('---\nconst a = "b";\n---\n\n<p>{a}</p>\n');
  });
});
