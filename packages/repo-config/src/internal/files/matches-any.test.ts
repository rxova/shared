import { describe, expect, it } from 'vitest';
import { matchesAny } from '@/internal/files/matches-any';

describe('matchesAny', () => {
  it('matches any of the globs', () => {
    expect(matchesAny('core/releases.md', ['x', '**/releases.md'])).toBe(true);
    expect(matchesAny('releases.md', ['**/releases.md'])).toBe(true);
    expect(matchesAny('a/api/reference/b.md', ['**/api/reference/**'])).toBe(true);
    expect(matchesAny('a/b.md', ['**/api/**'])).toBe(false);
    expect(matchesAny('a.md', [])).toBe(false);
  });
});
