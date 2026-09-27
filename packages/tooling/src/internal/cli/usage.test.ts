import { describe, expect, it } from 'vitest';
import { usage } from '@/internal/cli/usage';

describe('usage', () => {
  it('lists every command with its summary, aligned on the longest name', () => {
    const text = usage({
      go: { summary: 'go somewhere', load: () => Promise.resolve(() => 0) },
      'stay-put': { summary: 'stay', load: () => Promise.resolve(() => 0) },
    });
    expect(text).toBe(
      [
        'usage: rxova-tooling <command> [args]',
        '',
        '  go        go somewhere',
        '  stay-put  stay',
      ].join('\n'),
    );
  });
});
