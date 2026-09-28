import { describe, expect, it } from "vitest";
import config from "@rxova/repo-config/lint-staged";

describe("the lint-staged preset", () => {
  it("lints then formats code, including astro files", () => {
    expect(config["*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,astro}"]).toEqual([
      "eslint --fix --no-warn-ignored",
      "prettier --write",
    ]);
  });

  it("formats data, styles and prose", () => {
    expect(config["*.{json,jsonc,css,scss,md,mdx,yaml,yml,html}"]).toBe("prettier --write");
  });

  it("holds only those two globs", () => {
    expect(Object.keys(config)).toHaveLength(2);
  });
});
