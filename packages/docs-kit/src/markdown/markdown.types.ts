export interface ComponentRules {
  /**
   * More components to unwrap, beside the defaults (`Tabs`, `TabItem`,
   * `CardGrid`, `Card`, `Steps`, `Aside`, `LinkCard`). An opening or closing
   * tag alone on its line is removed and its children kept.
   */
  readonly unwrap?: readonly string[];
  /**
   * Components whose opening tag becomes a heading of this level, titled by
   * its `label` or `title` attribute. Merged over the defaults
   * (`TabItem: 4`, `Card: 3`), so the install snippets in a Tabs block keep
   * saying which package manager each one is for.
   */
  readonly headings?: Readonly<Record<string, number>>;
}

export interface MdxToMarkdownOptions {
  /** The site origin, `import.meta.env.SITE`: twins are read detached from the site. */
  readonly origin: string;
  /** The mount, `import.meta.env.BASE_URL`. Defaults to `/`. */
  readonly base?: string | undefined;
  /** The twin's own route (`/learn/x.md`), for resolving doc-relative links. Defaults to `/index.md`. */
  readonly fromRoute?: string | undefined;
  /** Which components are layout and how to flatten them. */
  readonly components?: ComponentRules | undefined;
  /**
   * Repository-specific rewrites run first, each as its own pass over the
   * unfenced text, in order — for components that carry content (a live
   * example, a generated table). A pass may emit fences; later passes and the
   * standard rules then leave them alone.
   */
  readonly expand?: readonly ((chunk: string) => string)[] | undefined;
  /** Rewrites each opening fence line, e.g. to drop a `live` meta that is not a language. */
  readonly fenceOpen?: ((line: string) => string) | undefined;
}
