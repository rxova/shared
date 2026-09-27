import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { baseVitestConfig } from '@/vitest/base-vitest-config';

describe('baseVitestConfig', () => {
  it('holds every file to the shared thresholds', () => {
    const coverage = baseVitestConfig().test?.coverage;
    expect(coverage).toMatchObject({
      provider: 'v8',
      thresholds: { perFile: true, statements: 95, branches: 95, functions: 95, lines: 95 },
    });
  });

  it('defaults to Node, colocated tests and the log plus lcov reporters', () => {
    const { test } = baseVitestConfig();
    expect(test?.environment).toBe('node');
    expect(test?.include).toEqual(['src/**/*.test.ts', 'src/**/*.test.tsx']);
    expect(test?.coverage).toMatchObject({ reporter: ['text', 'lcov'] });
  });

  it('keeps barrels, types, tests and fixtures out of coverage, plus any extra', () => {
    const { test } = baseVitestConfig({ exclude: ['src/generated.ts'] });
    expect(test?.coverage).toMatchObject({
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.fixtures.{ts,tsx}',
        'src/**/*.types.ts',
        'src/index.ts',
        'src/generated.ts',
      ],
    });
  });

  it('takes the environment, discovery globs and reporters from the package', () => {
    const { test } = baseVitestConfig({
      environment: 'jsdom',
      include: ['test/**/*.ts'],
      reporter: ['json-summary'],
    });
    expect(test?.environment).toBe('jsdom');
    expect(test?.include).toEqual(['test/**/*.ts']);
    expect(test?.coverage).toMatchObject({ reporter: ['json-summary'] });
  });

  it('maps @/ to the package src and @rxova-<name>/ to a sibling workspace, from root', () => {
    const alias = baseVitestConfig({ root: '/repo/packages/lib' }).resolve?.alias as {
      find: RegExp;
      replacement: string;
    }[];
    expect(alias).toHaveLength(2);
    const resolve = (specifier: string) =>
      alias.reduce((id, { find, replacement }) => id.replace(find, replacement), specifier);
    expect(resolve('@/scope/decide-scope')).toBe(
      `${join('/repo/packages/lib', 'src')}/scope/decide-scope`,
    );
    expect(resolve('@rxova-helpers/cli/usage')).toBe(
      `${join('/repo/packages')}/helpers/src/cli/usage`,
    );
    expect(resolve('vitest/config')).toBe('vitest/config');
    expect(baseVitestConfig().resolve?.alias).toHaveLength(2);
  });
});
