import { describe, expect, it } from 'vitest';
import { hookGroups } from '@/install/hook-groups';
import { withOwnHooks } from '@/install/with-own-hooks';

const runner = '/h/.claude/rx-ai/hooks.js';
const command = (name: string, timeout = 5) => ({
  type: 'command',
  command: `node "${runner}" ${name}`,
  timeout,
});

describe('hookGroups', () => {
  it('groups the chosen hooks by event and matcher', () => {
    expect(
      hookGroups(runner, [
        'no-bypass',
        'danger-zone',
        'config-lock',
        'memory-snapshot',
        'handoff-reminder',
      ]),
    ).toEqual({
      PreToolUse: [
        { matcher: 'Bash', hooks: [command('no-bypass'), command('danger-zone')] },
        { matcher: 'Edit|Write|MultiEdit', hooks: [command('config-lock')] },
      ],
      PreCompact: [{ hooks: [command('memory-snapshot', 10)] }],
      SessionEnd: [{ hooks: [command('memory-snapshot', 10)] }],
      SessionStart: [{ hooks: [command('handoff-reminder')] }],
    });
  });

  it('is empty when no hook is chosen', () => {
    expect(hookGroups(runner, ['rx-planner'])).toEqual({});
  });
});

describe('withOwnHooks', () => {
  const groups = hookGroups(runner, ['no-bypass', 'handoff-reminder']);

  it('adds its groups after the ones already there', () => {
    const mine = { matcher: 'Bash', hooks: [{ type: 'command', command: 'mine.sh' }] };
    expect(withOwnHooks({ hooks: { PreToolUse: [mine] } }, groups)).toEqual({
      hooks: {
        PreToolUse: [mine, ...(groups.PreToolUse ?? [])],
        SessionStart: groups.SessionStart,
      },
    });
  });

  it('replaces an older copy of its own groups, and keeps other events', () => {
    const once = withOwnHooks({ hooks: { Stop: [] } }, groups);
    expect(withOwnHooks(once, groups)).toEqual({ hooks: { Stop: [], ...groups } });
  });

  it('starts an event over when it is not a list, and adds nothing for no groups', () => {
    expect(withOwnHooks({ hooks: { PreToolUse: 'x' } }, groups)).toEqual({ hooks: groups });
    expect(withOwnHooks({ model: 'x' }, {})).toEqual({ model: 'x' });
  });
});
