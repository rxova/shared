import type { DocsPage } from "@/pages/docs-pages.types";

/** One index entry: the twin's link and, when there is one, what the page answers. */
export const linkLine = (page: DocsPage, note?: string): string =>
  `- [${page.title}](${page.mdUrl})${note === undefined || note === "" ? "" : `: ${note}`}`;
