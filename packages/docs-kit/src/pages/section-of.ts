import { HOME_ID } from '@/internal/pages/home-id';

/**
 * Which llms.txt section a page belongs to: its top-level directory, or `root`
 * for the home page and any file at the content root. Derived from the tree,
 * so a new directory sections itself with no edit anywhere; `llmsIndex` maps
 * the name to a label. A site organised differently passes its own
 * `sectionOf` to `docsPages`.
 */
export const sectionOf = (id: string): string => {
  const slash = id.indexOf('/');
  return id === HOME_ID || slash === -1 ? 'root' : id.slice(0, slash);
};
