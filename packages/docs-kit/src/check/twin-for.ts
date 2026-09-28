/** The `.md` twin a built page should have: `a/b/index.html` is `a/b.md`, `index.html` is `index.md`. */
export const twinFor = (htmlPath: string): string =>
  htmlPath === "index.html" ? "index.md" : `${htmlPath.replace(/\/index\.html$/, "")}.md`;
