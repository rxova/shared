import { describe, expect, it } from 'vitest';
import { hookGroups } from '@/install/hook-groups';
import { withOwnHooks } from '@/install/with-own-hooks';

describe('withOwnHooks', () => {
  const groups = hookGroups('/h/.claude/rx-ai/hooks.js');

  it('adds a group per matcher, running each guard through the runner', () => {
    expect(groups).toEqual([
      {
        matcher: 'Bash',
        hooks: [
          { type: 'command', command: 'node "/h/.claude/rx-ai/hooks.js" no-bypass', timeout: 5 },
          {
            type: 'command',
            command: 'node "/h/.claude/rx-ai/hooks.js" no-attribution',
            timeout: 5,
          },
        ],
      },
      {
        matcher: 'Edit|Write|MultiEdit',
        hooks: [
          { type: 'command', command: 'node "/h/.claude/rx-ai/hooks.js" config-lock', timeout: 5 },
        ],
      },
    ]);
    expect(withOwnHooks({}, groups)).toEqual({ hooks: { PreToolUse: groups } });
  });

  it('keeps other events and replaces an older copy of its own groups', () => {
    const once = withOwnHooks({ hooks: { Stop: [] } }, groups);
    expect(withOwnHooks(once, groups)).toEqual({ hooks: { Stop: [], PreToolUse: groups } });
  });

  it('starts PreToolUse over when it is not a list', () => {
    expect(withOwnHooks({ hooks: { PreToolUse: 'x' } }, groups)).toEqual({
      hooks: { PreToolUse: groups },
    });
  });
});
