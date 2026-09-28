import { llmsHead } from '@/internal/llms/llms-head';
import { groupPages } from '@/llms/group-pages';
import type { LlmsOptions } from '@/llms/llms.types';
import type { DocsPage } from '@/pages/docs-pages.types';

/**
 * `llms-full.txt`: every page inlined, in the order the index lists them, each
 * under a rule with its title and the human page it came from, for the case
 * where one fetch should be the whole documentation. `checkMdRoutes` holds it to
 * a size budget.
 */
export const llmsFull = (
  pages: readonly DocsPage[],
  { project, summary, sections, optional }: LlmsOptions,
): string => {
  const grouped = groupPages(pages, { sections, optional });
  const ordered = [...grouped.groups.flatMap((group) => group.pages), ...grouped.optional];
  return [
    llmsHead(project, summary).join('\n'),
    ...ordered.map((page) =>
      ['---', '', `# ${page.title}`, '', `Source: ${page.htmlUrl}`, '', page.body, ''].join('\n'),
    ),
  ].join('\n');
};
