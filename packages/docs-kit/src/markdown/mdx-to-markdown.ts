import { absolutizeUrls } from "@/internal/markdown/absolutize-urls";
import { componentRules } from "@/internal/markdown/component-rules";
import { resolveRelativeLinks } from "@/internal/markdown/resolve-relative-links";
import { stripImports } from "@/internal/markdown/strip-imports";
import { unwrapComponents } from "@/internal/markdown/unwrap-components";
import { mapUnfenced } from "@/markdown/map-unfenced";
import type { MdxToMarkdownOptions } from "@/markdown/markdown.types";

/**
 * A docs page's Markdown/MDX source as the plain Markdown served at its `.md`
 * twin.
 *
 * Normalized rather than rendered and converted back: that would reformat
 * every code fence, and the fences are what a reader wants verbatim. What is
 * left to handle is a closed set — MDX imports, layout components, doc-relative
 * and root-relative links — and `checkMdRoutes` fails the build when a twin
 * grows something outside it. Every rule runs through `mapUnfenced`, so a
 * snippet's own `import` lines and paths are never touched.
 *
 * `expand` passes run first (they may emit fences), then per chunk: imports,
 * components, doc-relative links, root-relative URLs — relative before
 * root-relative, since resolving `../x.md` produces a rooted path.
 */
export const mdxToMarkdown = (
  source: string,
  {
    origin,
    base = "/",
    fromRoute = "/index.md",
    components,
    expand = [],
    fenceOpen,
  }: MdxToMarkdownOptions,
): string => {
  const rules = componentRules(components);
  const expanded = expand.reduce((text, pass) => mapUnfenced(text, pass), source);
  return mapUnfenced(
    expanded,
    (chunk) =>
      absolutizeUrls(
        resolveRelativeLinks(unwrapComponents(stripImports(chunk), rules), {
          origin,
          base,
          fromRoute,
        }),
        { origin, base },
      ),
    fenceOpen,
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
