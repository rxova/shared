import { describe, expect, it } from 'vitest';
import { memorySnapshot } from '@/hooks/memory-snapshot';
import { contextWith } from '@/internal/hooks/context.fixtures';
import { transcript } from '@/internal/hooks/transcript.fixtures';

const git = {
  'git rev-parse --abbrev-ref HEAD': { stdout: 'feat/login\n' },
  'git status --short': { stdout: ' M src/login.tsx\n' },
  'git log --oneline -5': { stdout: 'abc123 feat: start\n' },
};

describe('memorySnapshot', () => {
  it('writes a git-ignored snapshot of the session to .claude/handoff/auto', () => {
    const context = contextWith({ files: { '/t.jsonl': transcript() }, programs: git });
    const input = { cwd: '/repo', transcript_path: '/t.jsonl', hook_event_name: 'PreCompact' };
    expect(memorySnapshot.run(input, context)).toEqual({ code: 0 });
    expect(context.files['/repo/.claude/handoff/auto/.gitignore']).toBe('*\n');
    const note = context.files['/repo/.claude/handoff/auto/2026-09-28-12-00-PreCompact.md'] ?? '';
    expect(note).toContain('# Snapshot (PreCompact, 2026-09-28 12:00 UTC)');
    expect(note).toContain('`feat/login`');
    expect(note).toContain(' M src/login.tsx');
    expect(note).toContain('abc123 feat: start');
    expect(note).toContain('- /repo/src/login.tsx\n- /repo/n.ipynb');
    expect(note).not.toContain('app.tsx');
    expect(note).toContain('- Add a login page');
    expect(note).toContain(`${'x'.repeat(300)}…`);
    expect(note).not.toContain('/clear');
  });

  it('leaves out what it cannot find, outside git and without a transcript', () => {
    const context = contextWith();
    memorySnapshot.run({ cwd: '/repo', transcript_path: '/missing.jsonl' }, context);
    const note = context.files['/repo/.claude/handoff/auto/2026-09-28-12-00-snapshot.md'] ?? '';
    expect(note).toContain('# Snapshot (snapshot,');
    expect(note).not.toContain('## ');
  });

  it('keeps only the newest ten snapshots', () => {
    const files = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [
        `/repo/.claude/handoff/auto/2026-09-${String(10 + i)}-00-00-SessionEnd.md`,
        'old',
      ]),
    );
    const context = contextWith({ files });
    memorySnapshot.run({ cwd: '/repo', hook_event_name: 'SessionEnd' }, context);
    const left = Object.keys(context.files).filter((file) => file.endsWith('.md'));
    expect(left).toHaveLength(10);
    expect(left).not.toContain('/repo/.claude/handoff/auto/2026-09-10-00-00-SessionEnd.md');
    expect(left).toContain('/repo/.claude/handoff/auto/2026-09-28-12-00-SessionEnd.md');
  });

  it('does nothing without a working directory', () => {
    const context = contextWith();
    expect(memorySnapshot.run({}, context)).toEqual({ code: 0 });
    expect(context.files).toEqual({});
  });
});
