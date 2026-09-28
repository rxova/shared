import { describe, expect, it } from 'vitest';
import { bannedMatches } from '@/internal/docs/banned-matches';

describe('bannedMatches', () => {
  it('reports every line and pattern that matches, with word boundaries respected', () => {
    const banned = [
      { name: 'useApi', pattern: '\\buseApi\\b' },
      { name: 'old', pattern: 'OLD', flags: 'i' },
    ];
    const content = 'call useApi()\nuseApiX is fine\nthe old useApi\n';
    expect(bannedMatches(content, banned)).toEqual([
      { line: 1, name: 'useApi' },
      { line: 3, name: 'useApi' },
      { line: 3, name: 'old' },
    ]);
    expect(bannedMatches(content, [])).toEqual([]);
  });
});
