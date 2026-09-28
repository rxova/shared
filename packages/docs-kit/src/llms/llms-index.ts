import { trimTrailingSlashes } from "@/internal/links/trim-trailing-slashes";
import { linkLine } from "@/internal/llms/link-line";
import { llmsHead } from "@/internal/llms/llms-head";
import { groupPages } from "@/llms/group-pages";
import type { LlmsIndexOptions } from "@/llms/llms.types";
import type { DocsPage } from "@/pages/docs-pages.types";

/**
 * `llms.txt`: the H1, the summary, where everything-in-one-fetch lives, the
 * caller's preamble, then a link per page under its section's heading, the
 * optional reference last. Links point at the `.md` twins: an agent following
 * one wants the content, not the chrome. Absolute throughout, because the file
 * is read detached from the site as often as it is fetched from it.
 */
export const llmsIndex = (
  pages: readonly DocsPage[],
  { project, summary, mount, preamble = [], sections, optional }: LlmsIndexOptions,
): string => {
  const grouped = groupPages(pages, { sections, optional });
  const lines = [
    ...llmsHead(project, summary),
    "Every link below is raw markdown. The human page is the same URL without the",
    "`.md` suffix.",
    "",
    `Everything inlined in one fetch: ${trimTrailingSlashes(mount)}/llms-full.txt`,
    "",
    ...preamble,
  ];
  if (preamble.length > 0 && preamble.at(-1) !== "") lines.push("");

  for (const { heading, pages: group } of grouped.groups) {
    lines.push(`## ${heading}`, "", ...group.map((page) => linkLine(page, page.description)), "");
  }

  if (grouped.optional.length > 0) {
    const intro = optional?.intro ?? [];
    const links =
      optional?.links?.(grouped.optional) ?? grouped.optional.map((page) => linkLine(page));
    lines.push("## Optional", "", ...intro, ...(intro.length > 0 ? [""] : []), ...links, "");
  }

  return lines.join("\n");
};
