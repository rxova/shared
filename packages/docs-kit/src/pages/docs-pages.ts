import { HOME_ID } from "@/internal/pages/home-id";
import { withBase } from "@/links/with-base";
import { mdxToMarkdown } from "@/markdown/mdx-to-markdown";
import type { DocsEntry, DocsPage, DocsPagesOptions } from "@/pages/docs-pages.types";
import { firstSentence } from "@/pages/first-sentence";
import { htmlRoute } from "@/pages/html-route";
import { mdRoute } from "@/pages/md-route";
import { sectionOf as defaultSectionOf } from "@/pages/section-of";

/**
 * Every documentation page, normalized to Markdown and sorted by id: the one
 * enumeration the `.md` twins, llms.txt and llms-full.txt all use, so they can
 * never disagree about which pages exist.
 *
 * Takes the collection's entries rather than reading `astro:content` itself,
 * so it runs (and is tested) outside an Astro build:
 * `docsPages(await getCollection('docs'), { origin: import.meta.env.SITE, base: import.meta.env.BASE_URL })`.
 * Routes are relative to the base, as Astro writes them; URLs are absolute,
 * because a twin read detached from the site has nothing to resolve against.
 */
export const docsPages = (
  entries: readonly DocsEntry[],
  {
    origin,
    base = "/",
    exclude = (entry) => entry.data.template === "splash",
    excludeIds,
    sectionOf = defaultSectionOf,
    markdown = {},
  }: DocsPagesOptions,
): DocsPage[] => {
  const toUrl = (pathname: string) => `${origin}${withBase(pathname, base)}`;
  const excludedId = (id: string) =>
    excludeIds instanceof RegExp ? excludeIds.test(id) : (excludeIds?.includes(id) ?? false);

  return entries
    .filter((entry) => !exclude(entry) && !excludedId(entry.id))
    .map((entry): DocsPage => {
      const body = entry.body ?? "";
      const id = entry.id === "" ? HOME_ID : entry.id;
      const route = mdRoute(id);
      return {
        id,
        title: entry.data.title,
        description: entry.data.description ?? firstSentence(body),
        section: sectionOf(id),
        mdRoute: route,
        htmlUrl: toUrl(htmlRoute(id)),
        mdUrl: toUrl(route),
        body: mdxToMarkdown(body, { ...markdown, origin, base, fromRoute: route }),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, "en"));
};
