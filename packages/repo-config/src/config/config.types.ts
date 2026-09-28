/** One command the pre-push gate runs. */
export interface Step {
  name: string;
  command: string;
  /**
   * Skipped on the release pull request (`GITHUB_HEAD_REF` is
   * `changeset-release/main`), whose only change is the version bump: an audit
   * or a pack smoke there repeats what the merge before it already proved.
   */
  skipOnRelease?: boolean;
}

/** How `check-llms` compares a package's `llms.txt` with its source. */
export type LlmsApi = "exact" | "documented" | "props" | "none";

/** The `llms.txt` rules a package can set for itself, in its own `package.json#repoConfig.llms`. */
export interface PackageLlmsConfig {
  /**
   * `exact` (default): the `## API` table and the entries name the same exports.
   * `documented`: every name in the `## API` table is exported; more exports are fine.
   * `props`: every name in a `## Props` table is a property of an interface in `src/types.ts`.
   * `none`: no table is checked.
   */
  api?: LlmsApi;
  /** Strings the file must contain: commands, URLs, anything an agent must find. */
  requiredTerms?: string[];
  /** A regex source: every match in the file must be one of the ids `idsFrom` reads. */
  idPattern?: string;
  /** `path/to/file.ts#NAME`: an exported `as const` array of strings, every one of which the file must mention. */
  idsFrom?: string;
}

/** `repoConfig.llms`: the rules for every published package, which each may override. */
export interface LlmsConfig extends PackageLlmsConfig {
  /** `index` (default) reads `src/index.ts`; `subpaths` also reads every `src/<dir>/index.ts`. */
  entries?: "index" | "subpaths";
  /** The `## ` headings the file needs; `A|B` accepts either. `API` is added for `api: "exact"`. */
  sections?: string[];
  /** The root `llms.txt` exists and links every package's file (default true). */
  rootIndex?: boolean;
}

/** A pattern `check-banned` rejects in the docs, as a regex source (JSON has no regex literal). */
export interface BannedPattern {
  name: string;
  pattern: string;
  flags?: string;
}

/** The `repoConfig` field of the root `package.json`. Every key is optional. */
export interface RepoConfig {
  verify?: {
    /** The ordered gate. Replaces the default list entirely. */
    steps?: Step[];
  };
  changeset?: {
    /** Each changeset file names exactly one package. */
    singlePackage?: boolean;
    /**
     * `code` (default): a package's code changed, markdown and tests aside.
     * `shipped`: anything the package's tarball ships changed, its README and llms.txt included.
     */
    scope?: "code" | "shipped";
    /** Where `add-changeset` looks for packages (default `packages`, `apps`). */
    roots?: string[];
    /** A name prefix `add-changeset` also accepts without: `journey-` lets `core` name `@rxova/journey-core`. */
    aliasPrefix?: string;
    /** `add-changeset` also offers private packages (a versioned private root, say). */
    includePrivate?: boolean;
    /** `version` copies this package's version into the root `package.json`. */
    syncRootVersionFrom?: string;
  };
  majors?: {
    /** The packages that move in lockstep; every published package by default. */
    packages?: string[];
  };
  tsdoc?: {
    /** Entry file per package name, instead of `packages/<dir>/src/index.ts`. */
    entries?: Record<string, string>;
    /** Export names that need no summary. */
    exclude?: string[];
  };
  docs?: {
    /** The hand-written docs, scanned for `.md` and `.mdx` (default `apps/docs/src/content/docs`). */
    root?: string;
    banned?: BannedPattern[];
    /** Globs under `root` where a banned name is legitimate: a migration guide, release notes. */
    allow?: string[];
    /** Globs under `root` that are not scanned at all: generated reference, cut versions. */
    exclude?: string[];
    /** Also scan the root README and every `packages/<dir>/README.md` (default true). */
    readmes?: boolean;
  };
  snippets?: {
    /** Files (globs) whose code fences must parse. */
    include?: string[];
    /** A fence whose info string holds one of these words is skipped (default `live`). */
    skipInfo?: string[];
  };
  packages?: {
    /** `list-packages` lists the packages whose manifest has this dotted key, such as `rxova.slug`. */
    marker?: string;
  };
  postPublish?: {
    /** A regex source: which published packages are imported (default every one). */
    importPattern?: string;
    /** Installed beside the published packages, the way a consumer provides peers. */
    peers?: Record<string, string>;
  };
  llms?: LlmsConfig;
  scope?: {
    /**
     * Globs of paths that change no code: a range touching only these (and
     * release bookkeeping) reports `code-changed=false` from `check-scope`.
     * Default `**\/*.md`, `**\/*.mdx`.
     */
    ignore?: string[];
    /**
     * Globs that count as code even when `ignore` matches them: markdown a test
     * reads or a package ships as content. Default `packages/*\/*\/**` (anything
     * below a package's top level) and test and fixture folders.
     */
    keep?: string[];
    /** Globs of the docs site's sources, reported as `docs-changed` (default `apps/docs/**`). */
    site?: string[];
  };
  testScripts?: {
    /** Directories (globs) that must have a `test` script when they hold a `vitest.config.*`. */
    globs?: string[];
  };
  fileSize?: {
    /** Lines a tracked file may have (default 500). */
    max?: number;
    /** Extensions checked (default ts, tsx, js, mjs, cjs, astro, css, yaml, yml, json). */
    extensions?: string[];
    /** File names never checked (default `pnpm-lock.yaml`). */
    ignore?: string[];
    /** Paths over the limit today. It shrinks only: an allowed file back under the limit fails. */
    allow?: string[];
  };
}

/** A command a packed bin is run with, and what its output must contain. */
export interface BinCheck {
  args: string[];
  /** Printed by the bin; semver when unset. */
  expect?: string;
}

/** A bin run against a fixture in the scratch project. */
export interface FixtureRun {
  bin: string;
  args: string[];
  /** Written before the run; relative to the scratch project. */
  fixture?: { path: string; contents: string };
  /** Substrings the fixture holds afterwards, or the output when there is no fixture. */
  expect: string[];
}

/** The `repoConfig` field of one package's own `package.json`. */
export interface PackageConfig {
  packSmoke?: {
    /** `auto` (default): import the package when it has a JavaScript entry. `never`: skip the probe. */
    load?: "auto" | "never";
    /** `false` runs no bin; an entry replaces the `--version` check for that bin. */
    bins?: false | Record<string, BinCheck>;
    run?: FixtureRun[];
  };
  llms?: PackageLlmsConfig;
  exports?: {
    /** The `attw --profile` for `check-exports`. */
    profile?: string;
  };
}

/** Reads a file, or undefined when there is none. Injected for tests. */
export type Reader = (file: string) => string | undefined;
