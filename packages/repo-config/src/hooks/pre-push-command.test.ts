import { describe, expect, it, vi } from 'vitest';
import { prePushCommand } from '@/hooks/pre-push-command';

const ZERO = '0'.repeat(40);
const SHA = 'f'.repeat(40);

describe('prePushCommand', () => {
  it('skips a delete-only push', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const verify = vi.fn(() => 1);
    expect(
      prePushCommand([], { input: () => `(delete) ${ZERO} refs/heads/x ${SHA}\n`, verify }),
    ).toBe(0);
    expect(verify).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining('nothing to verify'));
    log.mockRestore();
  });

  it('verifies a push that updates a ref, with the arguments given, and returns its code', () => {
    const verify = vi.fn(() => 3);
    const input = () => `refs/heads/x ${SHA} refs/heads/x ${ZERO}\n`;
    expect(prePushCommand(['--only', 'lint'], { input, verify })).toBe(3);
    expect(verify).toHaveBeenCalledWith(['--only', 'lint']);
  });

  it('verifies when run by hand, with no git input', () => {
    const verify = vi.fn(() => 0);
    expect(prePushCommand(undefined, { input: () => undefined, verify })).toBe(0);
    expect(verify).toHaveBeenCalledWith([]);
  });
});
