// Plain JavaScript on purpose: the pre-commit hook loads this before anything is
// built. A module rather than JSON: `export { default } from` a JSON file needs an
// import attribute that lint-staged's loader never passes.

/**
 * ESLint then Prettier over staged code, Prettier alone over everything else it
 * formats. `--no-warn-ignored` keeps a staged file that ESLint ignores (a config
 * file, an `.astro` file in a repository without the astro layer) from failing
 * the commit with a warning.
 *
 * @type {Record<string, string | string[]>}
 */
const config = {
  "*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,astro}": ["eslint --fix --no-warn-ignored", "prettier --write"],
  "*.{json,jsonc,css,scss,md,mdx,yaml,yml,html}": "prettier --write",
};

export default config;
