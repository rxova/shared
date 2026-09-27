import { join } from 'node:path';
import { defineConfig, type ViteUserConfig } from 'vitest/config';
import type { BaseVitestOptions } from '@/vitest/vitest.types';

/**
 * A package's Vitest config, from the shared preset. Every `vitest.config.ts`
 * is a one-liner over this, so raising the bar is a single-file change rather
 * than a sweep that misses a package.
 *
 * Coverage is per file, 95% on every axis, over every source file under `src/`
 * whether or not a test imports it. Barrels, `.types.ts` files, tests and
 * fixtures are left out: none has executable lines worth a threshold, so logic
 * that lands in one is logic nobody measures.
 *
 * Imports resolve the way the repositories write them: `@/…` is the package's
 * own `src/`, and `@rxova-<workspace>/…` is a sibling workspace's `src/`, the
 * same aliases the package's tsconfig `paths` declare.
 *
 * Nothing here imports another workspace: this file is loaded by plain Node
 * when a config imports it from source, before anything is built or aliased.
 */
export const baseVitestConfig = ({
  root = process.cwd(),
  environment = 'node',
  include = ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  exclude = [],
  reporter = ['text', 'lcov'],
}: BaseVitestOptions = {}): ViteUserConfig =>
  defineConfig({
    resolve: {
      alias: [
        { find: /^@\//, replacement: `${join(root, 'src')}/` },
        { find: /^@rxova-([a-z0-9-]+)\//, replacement: `${join(root, '..')}/$1/src/` },
      ],
    },
    test: {
      environment,
      include: [...include],
      coverage: {
        provider: 'v8',
        reporter: [...reporter],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.fixtures.{ts,tsx}',
          'src/**/*.types.ts',
          'src/index.ts',
          ...exclude,
        ],
        thresholds: { perFile: true, statements: 95, branches: 95, functions: 95, lines: 95 },
      },
    },
  });
