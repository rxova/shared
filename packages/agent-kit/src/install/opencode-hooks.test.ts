import { describe, expect, it } from 'vitest';
import { opencodeHooks } from '@/install/opencode-hooks';

describe('opencodeHooks', () => {
  it('sorts the chosen hooks onto the plugin’s events, leaving out what OpenCode cannot run', () => {
    expect(
      opencodeHooks([
        'no-bypass',
        'danger-zone',
        'secret-guard',
        'quick-check',
        'memory-snapshot',
        'handoff-reminder',
        'context-nudge',
        'rx-planner',
      ]),
    ).toEqual({
      before: [
        { matcher: 'Bash', names: ['no-bypass', 'danger-zone'] },
        { matcher: 'Edit|Write|MultiEdit', names: ['secret-guard'] },
      ],
      after: [{ matcher: 'Edit|Write|MultiEdit', names: ['quick-check'] }],
      compacting: ['memory-snapshot'],
      start: ['handoff-reminder'],
    });
  });

  it('runs a tool hook without a matcher on every tool', () => {
    const run = () => ({ code: 0 as const });
    const table = {
      a: { on: [{ event: 'PreToolUse' as const }], timeout: 5, summary: '', run },
      b: { on: [{ event: 'PostToolUse' as const }], timeout: 5, summary: '', run },
    };
    expect(opencodeHooks(['a', 'b'], table)).toMatchObject({
      before: [{ matcher: '*', names: ['a'] }],
      after: [{ matcher: '*', names: ['b'] }],
    });
  });

  it('is empty for no hooks', () => {
    expect(opencodeHooks([])).toEqual({ before: [], after: [], compacting: [], start: [] });
  });
});
