import type { Linter } from "eslint";
import type { defineConfig } from "eslint/config";

/** What `extends` takes in a `defineConfig()` block: configs, config arrays or plugin config names. */
type ExtendsElements = NonNullable<
  Extract<Parameters<typeof defineConfig>[0], { extends?: unknown }>["extends"]
>;

export interface RxovaReactOptions {
  /** Files the React layer lints. Defaults to `**\/*.{tsx,jsx}`; widen it for `.ts` hook files. */
  files?: readonly string[];
  /** eslint-plugin-react-hooks `recommended`. Defaults to `true`. */
  hooks?: boolean;
  /** eslint-plugin-jsx-a11y `recommended`. Defaults to `true`. */
  a11y?: boolean;
  /**
   * A regex source naming custom effect hooks whose dependency list `exhaustive-deps` checks,
   * e.g. `"(useIsomorphicLayoutEffect|useSafeLayoutEffect)"`.
   */
  additionalHooks?: string;
  /**
   * The React version eslint-plugin-react assumes. Defaults to the `react` the tsconfig root
   * resolves, else the latest.
   */
  version?: string;
}

export interface RxovaEslintOptions {
  /** The directory holding the root tsconfig: `import.meta.dirname` in `eslint.config.js`. */
  tsconfigRootDir: string;
  /** typescript-eslint `strictTypeChecked` instead of `recommendedTypeChecked`. */
  strict?: boolean;
  /** eslint-plugin-react, react-hooks and jsx-a11y, on `.tsx`/`.jsx` unless `files` says otherwise. */
  react?: boolean | RxovaReactOptions;
  /** eslint-plugin-astro `recommended`, with browser globals and the tsconfig root pinned. */
  astro?: boolean;
  /** Node globals on every file (`true`) or on these globs. */
  node?: boolean | readonly string[];
  /** Browser globals on every file (`true`) or on these globs. */
  browser?: boolean | readonly string[];
  /** Test-file relaxations and vitest/jest globals, on the default test globs or on `files`. */
  tests?: boolean | { files?: readonly string[] };
  /** Global ignores added to the defaults (dist, build, coverage, caches, tool config, …). */
  ignores?: readonly string[];
  /** Globs where `no-console` is off: CLIs and scripts whose output is stdout. */
  consoleAllowed?: readonly string[];
  /**
   * Shared configs merged into the TypeScript block, under the layers and the test and console
   * relaxations: `[tseslint.configs.stylisticTypeChecked]`, say. A config in `extra` would
   * override the relaxations instead.
   */
  extends?: ExtendsElements;
  /** Rules for TypeScript files, applied after the layers and before the test and console relaxations. */
  rules?: Linter.RulesRecord;
}

/**
 * The shared flat config: `@eslint/js` recommended, typescript-eslint `recommendedTypeChecked`
 * (`strictTypeChecked` with `strict`), a few correctness rules, and opt-in layers.
 *
 * @param extra Appended last, so they win.
 */
export declare const rxova: (
  options: RxovaEslintOptions,
  ...extra: Linter.Config[]
) => Linter.Config[];

export interface BaseEslintOptions {
  /** The directory holding the root tsconfig: `import.meta.dirname` in `eslint.config.js`. */
  tsconfigRootDir: string;
  /** Globs where `console` is the output contract. Defaults to `packages/repo-config/**`. */
  consoleAllowed?: readonly string[];
  /** Extra global ignores, beside dist, coverage, caches and tool config. */
  ignores?: readonly string[];
}

/**
 * @deprecated Use `rxova({ tsconfigRootDir, strict: true, node: true, tests: true, … })`, with
 * `extends: [tseslint.configs.stylisticTypeChecked]` and the relative-import ban in `rules` to keep
 * the 0.2 behaviour.
 * Removed in 0.4.0.
 */
export declare const baseEslintConfig: (
  options: BaseEslintOptions,
  ...extra: Linter.Config[]
) => Linter.Config[];
