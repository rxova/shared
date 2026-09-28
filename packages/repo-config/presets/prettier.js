// @ts-check
// Plain JavaScript on purpose: Prettier and the pre-commit hook load this before
// anything is built, so it cannot come from dist.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/**
 * The one Prettier config every rxova repository formats with.
 *
 * `prettier-plugin-astro` ships with this package, so a repository with `.astro`
 * files needs nothing beyond `"@rxova/repo-config/prettier"` in `.prettierrc`.
 *
 * @type {import('prettier').Config}
 */
const config = {
  semi: true,
  singleQuote: false,
  printWidth: 100,
  trailingComma: "all",
  arrowParens: "always",
  // An absolute path: Prettier resolves a plugin name from the directory of the
  // config that names it, and the plugin is this package's dependency, not the
  // consumer's.
  plugins: [require.resolve("prettier-plugin-astro")],
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};

export default config;
