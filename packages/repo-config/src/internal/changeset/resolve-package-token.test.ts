import { describe, expect, it } from 'vitest';
import { resolvePackageToken } from '@/internal/changeset/resolve-package-token';

const packages = [
  { name: '@rxova/core', tokens: ['@rxova/core', 'core'] },
  { name: 'core-x', tokens: ['core-x', 'core'] },
  { name: 'react', tokens: ['react'] },
];

describe('resolvePackageToken', () => {
  it('resolves a token, ignoring case and spaces', () => {
    expect(resolvePackageToken(' React ', packages)).toBe('react');
  });

  it('refuses an ambiguous or unknown token', () => {
    expect(() => resolvePackageToken('core', packages)).toThrow(
      'ambiguous package "core": it matches @rxova/core, core-x',
    );
    expect(() => resolvePackageToken('vue', packages)).toThrow('unknown package "vue"');
  });
});
