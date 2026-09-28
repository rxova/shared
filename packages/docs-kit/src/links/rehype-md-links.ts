import { dirname, relative, sep } from "node:path";
import { routeFor } from "@/internal/links/route-for";
import { walkElements } from "@/internal/links/walk-elements";
import { normalizePath } from "@/internal/markdown/normalize-path";
import type { HastNode, RehypeMdLinksOptions, SourceFile } from "@/links/links.types";
import { withBase } from "@/links/with-base";

/**
 * A rehype plugin that points doc-relative `.md` links at the HTML route that
 * serves them.
 *
 * The content links `../rules/x.md` — the shape the `.md` twins need, and the
 * one that stays right when a page is read as a file — but the HTML page for
 * that file is `/rules/x/`. Astro emits the href verbatim, and a links
 * validator does not resolve relative links, so without this the site ships
 * links that 404 and nothing objects. Add it to `markdown.rehypePlugins` as
 * `[rehypeMdLinks, { base, docsRoot }]`.
 */
export const rehypeMdLinks =
  ({ base, docsRoot }: RehypeMdLinksOptions) =>
  (tree: HastNode, file?: SourceFile): void => {
    // A page rendered from something other than a file has nothing to resolve against.
    if (file?.path === undefined) return;
    const dir = dirname(`/${relative(docsRoot, file.path).split(sep).join("/")}`);

    walkElements(tree, (node) => {
      if (node.tagName !== "a" || node.properties === undefined) return;
      const href = node.properties.href;
      if (typeof href !== "string") return;
      const match = /^(\.{1,2}\/[^#]*\.md|[^/#:][^#:]*\.md)(#.*)?$/.exec(href);
      if (match?.[1] === undefined) return;
      node.properties.href =
        withBase(routeFor(normalizePath(`${dir}/${match[1]}`)), base) + (match[2] ?? "");
    });
  };
