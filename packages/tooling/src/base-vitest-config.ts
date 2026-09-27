import { COVERAGE_EXCLUSIONS, COVERAGE_THRESHOLDS } from '@rxova/helpers';
import type { BaseVitestOptions } from './vitest.types.js';
import { defineConfig, type ViteUserConfig } from 'vitest/config';

/**
 * A package's Vitest config, from the shared preset. Every `vitest.config.ts`
 * is a one-liner over this, so raising the bar is a single-file change rather
 * than a sweep that misses a package. The thresholds are per file, and every
 * source file under `src/` is measured, whether or not a test imports it.
 */
export const baseVitestConfig = ({
  environment = 'node',
  include = ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  exclude = [],
  reporter = ['text', 'lcov'],
}: BaseVitestOptions = {}): ViteUserConfig =>
  defineConfig({
    test: {
      environment,
      include: [...include],
      coverage: {
        provider: 'v8',
        reporter: [...reporter],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [...COVERAGE_EXCLUSIONS, ...exclude],
        thresholds: { ...COVERAGE_THRESHOLDS },
      },
    },
  });
