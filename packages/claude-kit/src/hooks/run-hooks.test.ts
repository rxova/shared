import { describe, expect, it } from 'vitest';
import { runHooks } from '@/hooks/run-hooks';
import { contextWith } from '@/internal/hooks/context.fixtures';

const bash = (command: string) =>
  JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd: '/repo' });

describe('runHooks', () => {
  it('stops at the first hook that blocks', () => {
    const outcome = runHooks('dev-server, no-bypass,', bash('git push --no-verify'), contextWith());
    expect(outcome.code).toBe(2);
    expect(outcome.message).toContain('no-bypass');
  });

  it('joins the replies of hooks that answer, and passes when none blocks', () => {
    const context = contextWith({ files: { '/repo/.claude/handoff/2026-09-27-a.md': '' } });
    const start = JSON.stringify({ cwd: '/repo' });
    expect(
      runHooks('handoff-reminder,handoff-reminder', start, context).stdout?.split('\n'),
    ).toHaveLength(2);
    expect(runHooks('no-bypass', bash('git status'), context)).toEqual({ code: 0 });
    expect(runHooks('', bash('x'), context)).toEqual({ code: 0 });
  });

  it('keeps earlier replies when a later hook blocks', () => {
    const context = contextWith({ files: { '/repo/.claude/handoff/2026-09-27-a.md': '' } });
    const both = JSON.stringify({
      cwd: '/repo',
      tool_name: 'Bash',
      tool_input: { command: 'git commit -n' },
    });
    expect(runHooks('handoff-reminder,no-bypass', both, context)).toMatchObject({
      code: 2,
      stdout: expect.stringContaining('handoff') as string,
    });
  });

  it('uses the live context by default', () => {
    expect(runHooks('no-bypass', bash('git push --no-verify')).code).toBe(2);
  });
});
