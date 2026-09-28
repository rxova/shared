import { describe, expect, it } from 'vitest';
import { sectionOf } from '@/pages/section-of';

describe('sectionOf', () => {
  it.each([
    ['index', 'root'],
    ['changelog', 'root'],
    ['rules/assertion-weakened', 'rules'],
    ['under-the-hood/untrusted-input', 'under-the-hood'],
    ['recipes/deep/monorepo', 'recipes'],
  ])('%s -> %s', (id, expected) => {
    expect(sectionOf(id)).toBe(expected);
  });
});
