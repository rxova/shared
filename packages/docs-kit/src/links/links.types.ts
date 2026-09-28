/** The part of a hast node `rehypeMdLinks` reads and writes. */
export interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/** The part of a vfile `rehypeMdLinks` reads: the source path, when there is one. */
export interface SourceFile {
  path?: string | undefined;
}

export interface RehypeMdLinksOptions {
  /** The mount, the same `base` the Astro config sets. */
  readonly base: string;
  /** The content directory every source path is relative to: the route is the path below it. */
  readonly docsRoot: string;
}
