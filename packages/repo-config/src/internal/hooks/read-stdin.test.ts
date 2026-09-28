import { describe, expect, it, vi } from 'vitest';
import { readStdin } from '@/internal/hooks/read-stdin';

describe('readStdin', () => {
  it('reads nothing from a terminal', () => {
    const read = vi.fn(() => 'x');
    expect(readStdin({ isTTY: true }, read)).toBeUndefined();
    expect(read).not.toHaveBeenCalled();
  });

  it('reads file descriptor 0 when something is piped in', () => {
    const read = vi.fn(() => 'refs/heads/x abc');
    expect(readStdin({}, read)).toBe('refs/heads/x abc');
    expect(read).toHaveBeenCalledWith(0, 'utf8');
  });
});
