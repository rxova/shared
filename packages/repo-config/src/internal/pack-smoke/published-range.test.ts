import { describe, expect, it } from 'vitest';
import { publishedRange } from '@/internal/pack-smoke/published-range';

describe('publishedRange', () => {
  it('writes the range pnpm publishes for each workspace shorthand', () => {
    expect(publishedRange('workspace:^', '1.2.0')).toBe('^1.2.0');
    expect(publishedRange('workspace:~', '1.2.0')).toBe('~1.2.0');
    expect(publishedRange('workspace:*', '1.2.0')).toBe('1.2.0');
    expect(publishedRange('workspace:', '1.2.0')).toBe('1.2.0');
  });

  it('keeps an explicit range, and accepts anything without a version', () => {
    expect(publishedRange('workspace:^1.0.0', '1.2.0')).toBe('^1.0.0');
    expect(publishedRange('workspace:^', undefined)).toBe('*');
  });
});
