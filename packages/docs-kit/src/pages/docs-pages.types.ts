import type { MdxToMarkdownOptions } from "@/markdown/markdown.types";

/**
 * The part of a Starlight `docs` collection entry the pages are built from.
 * `getCollection('docs')` returns entries of this shape.
 */
export interface DocsEntry {
  readonly id: string;
  readonly body?: string | undefined;
  readonly data: {
    readonly title: string;
    readonly description?: string | undefined;
    readonly template?: string | undefined;
  };
}

/** One documentation page, normalized: what the twins, llms.txt and llms-full.txt all describe. */
export interface DocsPage {
  /** The entry id; the home page is `index`. */
  readonly id: string;
  readonly title: string;
  /** The frontmatter description, else the body's first sentence. */
  readonly description?: string | undefined;
  /** The llms.txt section key, from `sectionOf`. */
  readonly section: string;
  /** The twin's route relative to the base, as Astro writes it to disk. */
  readonly mdRoute: string;
  /** The absolute URL of the human page. */
  readonly htmlUrl: string;
  /** The absolute URL of the twin. */
  readonly mdUrl: string;
  /** The body as plain Markdown, links absolute. */
  readonly body: string;
}

export interface DocsPagesOptions {
  /** `import.meta.env.SITE`. */
  readonly origin: string;
  /** `import.meta.env.BASE_URL`. Defaults to `/`. */
  readonly base?: string | undefined;
  /** Entries to leave out. Defaults to splash pages: a landing page, not a document. */
  readonly exclude?: ((entry: DocsEntry) => boolean) | undefined;
  /** Ids to leave out as well, by list or pattern — a generated `api/` tree, a playground. */
  readonly excludeIds?: readonly string[] | RegExp | undefined;
  /** The section a page belongs to. Defaults to `sectionOf`. */
  readonly sectionOf?: ((id: string) => string) | undefined;
  /** The Markdown rules beyond origin, base and route: components, `expand`, `fenceOpen`. */
  readonly markdown?: Omit<MdxToMarkdownOptions, "origin" | "base" | "fromRoute"> | undefined;
}
