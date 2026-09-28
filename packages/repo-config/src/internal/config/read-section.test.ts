import { describe, expect, it } from 'vitest';
import { readSection } from '@/internal/config/read-section';

describe('readSection', () => {
  it('returns the object, or undefined when absent', () => {
    expect(readSection({ a: { x: 1 } }, 'a', 'repoConfig', ['x'])).toEqual({ x: 1 });
    expect(readSection({}, 'a', 'repoConfig', ['x'])).toBeUndefined();
  });

  it('refuses a non-object and an unknown key, naming the path', () => {
    expect(() => readSection({ a: [] }, 'a', 'repoConfig', [])).toThrow(
      'package.json#repoConfig.a must be an object',
    );
    expect(() => readSection({ a: { y: 1 } }, 'a', 'repoConfig', ['x'])).toThrow(
      'package.json#repoConfig.a has an unknown key "y"',
    );
  });
});
