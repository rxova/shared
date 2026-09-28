import type { DocsPage } from '@/pages/docs-pages.types';
import type { GroupOptions, Grouped, PageGroup } from '@/llms/llms.types';

/**
 * Pages grouped by section in the order a reader should meet them: the listed
 * sections first, then any other section alphabetically under its own key, and
 * the optional (reference) pages apart, in `optional.order` and then
 * alphabetically. No page is ever dropped.
 */
export const groupPages = (
  pages: readonly DocsPage[],
  { sections = [], optional }: GroupOptions = {},
): Grouped => {
  const bySection = new Map<string, DocsPage[]>();
  for (const page of pages) {
    const found = bySection.get(page.section);
    if (found === undefined) bySection.set(page.section, [page]);
    else found.push(page);
  }

  const isOptional = (key: string) => optional?.match(key) ?? false;
  const groups: PageGroup[] = [];
  const optionalByKey = new Map<string, DocsPage[]>();
  const take = (key: string, heading: string) => {
    const found = bySection.get(key);
    if (found === undefined) return;
    bySection.delete(key);
    if (isOptional(key)) optionalByKey.set(key, found);
    else groups.push({ heading, pages: found });
  };

  for (const [key, heading] of sections) if (!isOptional(key)) take(key, heading);
  for (const key of [...bySection.keys()].sort()) take(key, key);

  // Keys arrive alphabetically; a stable sort by rank keeps that order among unranked ones.
  const order = optional?.order ?? [];
  const rank = (key: string) => (order.includes(key) ? order.indexOf(key) : order.length);
  return {
    groups,
    optional: [...optionalByKey]
      .sort(([a], [b]) => rank(a) - rank(b))
      .flatMap(([, found]) => found),
  };
};
