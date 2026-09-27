import { describe, expect, it } from 'vitest';
import { formatLlmsFailures } from './format-llms-failures.ts';

describe('formatLlmsFailures', () => {
  it('counts the failures and lists one per line', () => {
    expect(formatLlmsFailures([{ where: 'lib', reason: 'is wrong' }])).toBe(
      'check:llms failed — 1 problem(s)\n  ✗ lib is wrong',
    );
  });
});
