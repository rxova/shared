import { fakeGit } from '@rxova-helpers/scope/fake-git.fixtures';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkScopeCommand } from '@/scope/check-scope-command';

describe('checkScopeCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  afterEach(() => {
    log.mockClear();
  });

  it('reports the verdict and always exits 0', () => {
    expect(checkScopeCommand({}, { run: fakeGit([]) })).toBe(0);
    expect(log).toHaveBeenCalledWith('check-scope: code-changed=true');
  });

  it('writes the step output when the workflow provides a file for it', () => {
    const dir = mkdtempSync(join(tmpdir(), 'check-scope-'));
    const output = join(dir, 'output');
    try {
      const env = { BASE_SHA: 'aaa', HEAD_SHA: 'bbb', GITHUB_OUTPUT: output };
      checkScopeCommand(env, { run: fakeGit(['a.ts']) });
      expect(readFileSync(output, 'utf8')).toBe('code-changed=true\n');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reads the environment and runs the real git by default', () => {
    vi.stubEnv('BASE_SHA', '');
    vi.stubEnv('GITHUB_OUTPUT', '');
    expect(checkScopeCommand()).toBe(0);
    expect(log).toHaveBeenCalledWith('check-scope: no usable commit range');
    vi.unstubAllEnvs();
  });
});
