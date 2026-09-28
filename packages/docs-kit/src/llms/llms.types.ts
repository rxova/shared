import type { DocsPage } from '@/pages/docs-pages.types';

/** A section key (the top directory, or `root`) and the heading it gets, in reading order. */
export type Section = readonly [key: string, heading: string];

export interface PageGroup {
  readonly heading: string;
  readonly pages: readonly DocsPage[];
}

export interface OptionalPages {
  /** Which section keys are reference material rather than prose — e.g. `(s) => s.startsWith('api:')`. */
  readonly match: (section: string) => boolean;
  /** Optional section keys in reading order; the rest follow alphabetically. */
  readonly order?: readonly string[] | undefined;
  /** Lines under the `## Optional` heading, before the links. */
  readonly intro?: readonly string[] | undefined;
  /**
   * The link lines for the optional pages. Defaults to one bare link per page;
   * a site with hundreds of generated pages collapses them, one link per group.
   */
  readonly links?: ((pages: readonly DocsPage[]) => readonly string[]) | undefined;
}

export interface GroupOptions {
  /**
   * Section keys and headings, in the order a reader should meet them — the
   * sidebar's order. A section not listed still appears, after these, under its
   * own key: an unlabelled section beats a missing one.
   */
  readonly sections?: readonly Section[] | undefined;
  /** Pages kept out of the prose groups and listed last, under `## Optional`. */
  readonly optional?: OptionalPages | undefined;
}

export interface Grouped {
  readonly groups: readonly PageGroup[];
  /** The optional pages, by section key, then in page order. */
  readonly optional: readonly DocsPage[];
}

export interface LlmsOptions extends GroupOptions {
  /** The H1: the project's name. */
  readonly project: string;
  /** The summary blockquote llmstxt.org puts under the H1, one line per entry. */
  readonly summary: readonly string[];
}

export interface LlmsIndexOptions extends LlmsOptions {
  /** Where the site lives, `${SITE}${BASE_URL}`: llms-full.txt is linked absolutely from here. */
  readonly mount: string;
  /** Lines between the header and the sections — how to install or run it, rules for agents. */
  readonly preamble?: readonly string[] | undefined;
}
