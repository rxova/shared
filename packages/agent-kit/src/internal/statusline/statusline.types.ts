/** The fields of Claude Code's status line input this script reads; every one may be missing. */
export interface StatusInput {
  sessionId: string;
  model: string;
  modelId: string;
  version?: string | undefined;
  cwd: string;
  projectDir: string;
  repo?: string | undefined;
  worktree?: string | undefined;
  addedDirs: number;
  outputStyle?: string | undefined;
  agent?: string | undefined;
  vimMode?: string | undefined;
  sessionName?: string | undefined;
  fastMode: boolean;
  thinking: boolean;
  effort?: string | undefined;
  costUsd?: number | undefined;
  durationMs?: number | undefined;
  apiDurationMs?: number | undefined;
  linesAdded: number;
  linesRemoved: number;
  contextSize: number;
  /** Tokens in the context after the last response: input plus cache reads and writes. */
  contextTokens?: number | undefined;
  cache?:
    | {
        hitRatio?: number | undefined;
        ttl?: string | undefined;
        expiresAt?: number | undefined;
        warm: boolean;
      }
    | undefined;
  limits: Limit[];
  spend?:
    | {
        usedUsd?: number | undefined;
        limitUsd?: number | undefined;
        period?: string | undefined;
        usedPercentage: number;
      }
    | undefined;
  pr?:
    | {
        number: number;
        url?: string | undefined;
        reviewState?: string | undefined;
        kind?: string | undefined;
      }
    | undefined;
}

/** One rate limit window. */
export interface Limit {
  label: "5h" | "7d";
  usedPercentage: number;
  /** Unix epoch seconds. */
  resetsAt?: number | undefined;
  /** The window's length in seconds. */
  windowSeconds: number;
}

/** The working tree, as `git status --porcelain=v2 --branch --show-stash` describes it. */
export interface GitState {
  branch: string;
  detached: boolean;
  ahead: number;
  behind: number;
  hasUpstream: boolean;
  staged: number;
  modified: number;
  untracked: number;
  conflicts: number;
  stashes: number;
  /** Unix epoch seconds of the last commit. */
  lastCommitAt?: number | undefined;
}

/** An RGB colour. */
export type Rgb = readonly [number, number, number];

/** How many colours the terminal takes. */
export type ColorMode = "truecolor" | "256" | "none";

/** A piece of a line; when the line is too wide, the lowest `priority` goes first. */
export interface Segment {
  text: string;
  priority: number;
}

/** Everything the renderer needs beside the input; gathered by the entry, faked in tests. */
export interface StatusFacts {
  git?: GitState | undefined;
  /** Context token counts seen earlier in this session, oldest first, ending with this one. */
  history: readonly number[];
  /** Unix epoch seconds. */
  now: number;
  columns: number;
  mode: ColorMode;
}
