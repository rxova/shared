import { describe, expect, it } from 'vitest';
import { runHook } from '@/hooks/run-hook';
import { contextWith } from '@/internal/hooks/context.fixtures';

const input = (command: string) => JSON.stringify({ tool_name: 'Bash', tool_input: { command } });

describe('runHook', () => {
  it('blocks with exit code 2 and names the hook in the message', () => {
    expect(runHook('no-bypass', input('git push --no-verify'), contextWith())).toEqual({
      code: 2,
      message: expect.stringMatching(/^rx-ai no-bypass: /) as string,
    });
  });

  it('lets an allowed call through with no message', () => {
    expect(runHook('no-bypass', input('git push'), contextWith())).toEqual({ code: 0 });
  });

  it('lets everything through for a hook switched off in RX_AI_OFF', () => {
    const context = contextWith({ env: { RX_AI_OFF: ' config-lock , no-bypass,' } });
    expect(runHook('no-bypass', input('git push --no-verify'), context)).toEqual({ code: 0 });
  });

  it('fails open on an unknown hook, input that is not a JSON object, or a hook that throws', () => {
    const context = contextWith();
    expect(runHook('nope', input('git push --no-verify'), context)).toEqual({ code: 0 });
    expect(runHook('toString', '{}', context)).toEqual({ code: 0 });
    expect(runHook('no-bypass', 'not json', context)).toEqual({ code: 0 });
    expect(runHook('no-bypass', 'null', context)).toEqual({ code: 0 });
    const throwing = {
      ...context,
      read: () => {
        throw new Error('disk');
      },
    };
    const edit = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git commit -F msg' },
      cwd: '/r',
    });
    expect(runHook('no-attribution', edit, throwing)).toEqual({ code: 0 });
  });

  it('uses the live context by default', () => {
    expect(runHook('no-bypass', input('git push --no-verify')).code).toBe(2);
  });
});
