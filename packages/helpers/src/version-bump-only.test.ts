import { describe, expect, it } from 'vitest';
import { BUMP, fakeGit } from './fake-git.fixtures.ts';
import { versionBumpOnly } from './version-bump-only.ts';

const RANGE = { base: 'aaa', head: 'bbb' };

describe('versionBumpOnly', () => {
  it('accepts a diff that only moves the version', () => {
    const run = fakeGit([], { 'packages/example/package.json': BUMP });
    expect(versionBumpOnly('packages/example/package.json', RANGE, run)).toBe(true);
  });

  it('rejects a dependency slipped in beside the bump', () => {
    const run = fakeGit([], { 'package.json': `${BUMP}\n+    "left-pad": "^1.3.0",` });
    expect(versionBumpOnly('package.json', RANGE, run)).toBe(false);
  });

  it('rejects a file with no edits at all', () => {
    expect(versionBumpOnly('package.json', RANGE, fakeGit([]))).toBe(false);
  });
});
