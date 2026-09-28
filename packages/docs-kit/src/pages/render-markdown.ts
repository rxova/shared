import type { DocsPage } from "@/pages/docs-pages.types";

/**
 * The document served at a page's `.md` route. The frontmatter is not
 * decoration: Starlight keeps the title in frontmatter and out of the body, so
 * the body alone arrives untitled, and `source` lets a reader cite the human
 * page. Title and description are JSON-quoted, which is valid YAML and survives
 * a colon.
 */
export const renderMarkdown = (
  page: Pick<DocsPage, "title" | "description" | "htmlUrl" | "body">,
): string =>
  [
    "---",
    `title: ${JSON.stringify(page.title)}`,
    ...(page.description === undefined || page.description === ""
      ? []
      : [`description: ${JSON.stringify(page.description)}`]),
    `source: ${page.htmlUrl}`,
    "---",
    "",
    `# ${page.title}`,
    "",
    page.body,
    "",
  ].join("\n");
