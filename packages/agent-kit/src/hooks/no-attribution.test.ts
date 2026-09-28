import { describe, expect, it } from 'vitest';
import { bash, contextWith } from '@/internal/hooks/context.fixtures';
import { noAttribution } from '@/hooks/no-attribution';

// Built from parts so the fixtures do not trip an attribution guard on this very file.
const TRAILER = ['Co', 'Authored', 'By'].join('-');
const SESSION = ['Claude', 'Session'].join('-');
const BADGE = String.fromCodePoint(0x1f916);

const files = contextWith({
  files: {
    '/repo/msg.txt': `feat: x\n\n${TRAILER}: Claude <noreply@anthropic.com>\n`,
    '/repo/clean.txt': 'feat: x\n',
    '/repo/body.md': `## Summary\n\n${BADGE} Generated with Claude Code\n`,
  },
});
const blocked = (command: string) => noAttribution(bash(command), files).block;

describe('noAttribution', () => {
  it.each([
    `git commit -m "feat: x" -m "${TRAILER}: Claude <noreply@anthropic.com>"`,
    `git commit -m "$(cat <<'EOF'\nfeat: x\n\n${SESSION}: abc\nEOF\n)"`,
    `git commit -F - <<'EOF'\nfix: y\n\n${TRAILER.toLowerCase()}: Claude Opus <x@anthropic.com>\nEOF`,
    'git add . && git commit -F msg.txt',
    'git commit --file=msg.txt',
    'gh pr create --title t --body "Done.\n\nGenerated with [Claude Code](https://claude.ai)"',
    'gh pr edit 3 --body-file body.md',
    'gh pr create -F body.md',
  ])('blocks %s', (command) => {
    expect(blocked(command)).toBe(true);
  });

  it.each([
    `git commit -m "feat: x" -m "${TRAILER}: Ada <ada@example.com>"`,
    'git commit -F clean.txt',
    'git commit -F missing.txt',
    'git commit -F -',
    'gh pr create --title "t" --body "a plain body"',
    `git log --grep "${TRAILER}: Claude"`,
    `gh pr view 3 | grep -i "${SESSION}:"`,
    'echo "Generated with Claude"',
  ])('allows %s', (command) => {
    expect(blocked(command)).toBe(false);
  });

  it('asks for the attribution to be removed', () => {
    expect(noAttribution(bash('git commit -F msg.txt'), files)).toEqual({
      block: true,
      reason: expect.stringContaining('Remove') as string,
    });
  });

  it('ignores every tool but Bash', () => {
    expect(
      noAttribution({ tool_name: 'Edit', tool_input: { command: 'git commit -F msg.txt' } }, files)
        .block,
    ).toBe(false);
  });

  it('resolves files from the current directory when the input has none', () => {
    expect(
      noAttribution({ tool_name: 'Bash', tool_input: { command: 'git commit -F x' } }, files).block,
    ).toBe(false);
  });
});
