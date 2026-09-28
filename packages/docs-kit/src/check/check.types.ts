import type { ComponentRules } from '@/markdown/markdown.types';

/** A pattern that must not match, and what a match means. */
export type Forbidden = readonly [pattern: RegExp, meaning: string];

export interface CheckMdRoutesOptions {
  /**
   * Built pages that deliberately have no twin, as paths under dist. An entry
   * ending in `/` covers everything below it (`playground/`). Defaults to
   * `['404.html']`; redirect stubs are always skipped.
   */
  readonly untwinned?: readonly string[] | undefined;
  /** Budget for `llms-full.txt`. Defaults to 800 KiB. */
  readonly maxFullBytes?: number | undefined;
  /** Budget for `llms.txt`, which is an index. Defaults to 24 KiB. */
  readonly maxIndexBytes?: number | undefined;
  /** The same component rules given to `mdxToMarkdown`: any of them left in a twin fails. */
  readonly components?: ComponentRules | undefined;
  /** More patterns the unfenced text of a twin must not match. */
  readonly forbidden?: readonly Forbidden[] | undefined;
  /** Patterns an opening fence line must not match, such as a leftover `live` meta. */
  readonly forbiddenInfo?: readonly Forbidden[] | undefined;
}

export interface CheckMdRoutesResult {
  /** One line per problem; empty when the build is sound. */
  readonly failures: readonly string[];
  /** Built HTML pages found. */
  readonly pages: number;
  /** `.md` twins found. */
  readonly twins: number;
}
