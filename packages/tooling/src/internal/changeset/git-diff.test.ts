import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { gitDiff } from '@/internal/changeset/git-diff';

describe('gitDiff', () => {
  it('lists the files an empty range changed — none', () => {
    const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    expect(gitDiff(head, head)).toEqual([]);
    expect(gitDiff(head, head, { existing: true })).toEqual([]);
  });
});
