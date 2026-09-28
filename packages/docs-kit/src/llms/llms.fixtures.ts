import type { DocsPage } from "@/pages/docs-pages.types";

/** A normalized page whose URLs and body are derived from its id. */
export const fakePage = (id: string, section: string, extra: Partial<DocsPage> = {}): DocsPage => ({
  id,
  section,
  title: id,
  description: `About ${id}`,
  mdRoute: `/${id}.md`,
  mdUrl: `https://rxova.org/${id}.md`,
  htmlUrl: `https://rxova.org/${id}/`,
  body: `Body of ${id}`,
  ...extra,
});

/** Prose in four sections, two generated reference groups. */
export const fakePages = (): DocsPage[] => [
  fakePage("index", "root"),
  fakePage("learn/why", "learn"),
  fakePage("rules/a", "rules", { description: undefined }),
  fakePage("recipes/x", "recipes"),
  fakePage("api/react/readme", "api:react"),
  fakePage("api/core/readme", "api:core"),
  fakePage("api/core/fn", "api:core"),
];
