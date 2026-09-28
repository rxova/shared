import type { KnipConfig } from "knip";

/** A knip config object (knip also takes a function returning one). */
export type KnipConfigObject = Exclude<KnipConfig, (...args: never[]) => unknown>;

/** One workspace's knip settings, as `workspaces[<dir>]` takes them. */
export type KnipWorkspace = NonNullable<KnipConfigObject["workspaces"]>[string];

export interface BaseKnipOptions {
  /**
   * The Starlight docs app, whose `@rxova/brand` dependency is reached through CSS and Astro
   * config rather than an import. Defaults to `apps/docs`; `false` when there is none.
   */
  readonly docsApp?: string | false;
  readonly ignoreDependencies?: readonly string[];
  readonly ignoreBinaries?: readonly string[];
  readonly ignore?: readonly string[];
  /** Per-workspace settings, merged into the defaults: list keys concatenate, the rest replace. */
  readonly workspaces?: Readonly<Record<string, KnipWorkspace>>;
}
