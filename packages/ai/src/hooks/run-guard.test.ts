import { describe, expect, it } from 'vitest';
import { filesWith } from '@/internal/hooks/guard.fixtures';
import { runGuard } from '@/hooks/run-guard';

const input = (command: string) => JSON.stringify({ tool_name: 'Bash', tool_input: { command } });
const files = filesWith();

describe('runGuard', () => {
  it('blocks with exit code 2 and names the guard in the message', () => {
    expect(runGuard('no-bypass', input('git push --no-verify'), { files })).toEqual({
      code: 2,
      message: expect.stringMatching(/^rx-ai no-bypass: /) as string,
    });
  });

  it('lets an allowed call through with no message', () => {
    expect(runGuard('no-bypass', input('git push'), { files })).toEqual({ code: 0 });
  });

  it('lets everything through for a guard switched off in RX_AI_OFF', () => {
    const off = ' config-lock , no-bypass,';
    expect(runGuard('no-bypass', input('git push --no-verify'), { off, files })).toEqual({
      code: 0,
    });
  });

  it('fails open on an unknown guard, input that is not JSON, or a guard that throws', () => {
    expect(runGuard('nope', input('git push --no-verify'), { files })).toEqual({ code: 0 });
    expect(runGuard('toString', '{}', { files })).toEqual({ code: 0 });
    expect(runGuard('no-bypass', 'not json', { files })).toEqual({ code: 0 });
    expect(runGuard('no-bypass', 'null', { files })).toEqual({ code: 0 });
  });

  it('reads RX_AI_OFF and the disk by default', () => {
    const before = process.env.RX_AI_OFF;
    process.env.RX_AI_OFF = 'no-bypass';
    expect(runGuard('no-bypass', input('git push --no-verify'))).toEqual({ code: 0 });
    delete process.env.RX_AI_OFF;
    expect(runGuard('no-bypass', input('git push --no-verify')).code).toBe(2);
    if (before !== undefined) process.env.RX_AI_OFF = before;
  });
});
