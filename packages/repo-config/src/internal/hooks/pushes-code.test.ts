import { describe, expect, it } from 'vitest';
import { pushesCode } from '@/internal/hooks/pushes-code';

const ZERO = '0'.repeat(40);
const SHA = 'a1b2c3'.padEnd(40, '0');

describe('pushesCode', () => {
  it('is true when any ref is updated', () => {
    expect(pushesCode(`refs/heads/x ${SHA} refs/heads/x ${ZERO}\n`)).toBe(true);
    expect(
      pushesCode(`(delete) ${ZERO} refs/heads/old ${SHA}\nrefs/heads/x ${SHA} refs/heads/x ${SHA}`),
    ).toBe(true);
  });

  it('is false for a delete-only push, and for no input at all', () => {
    expect(pushesCode(`(delete) ${ZERO} refs/heads/old ${SHA}\n`)).toBe(false);
    expect(pushesCode('')).toBe(false);
    expect(pushesCode('\r\n')).toBe(false);
  });
});
