import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { lintChangesetsCommand } from '@/changeset/lint-changesets-command';

describe('lintChangesetsCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  const files: Record<string, string> = {
    [join('/repo', '.changeset', 'ok.md')]: '---\n"a": patch\n---\n\nFix.\n',
    [join('/repo', '.changeset', 'two.md')]: '---\n"a": patch\n"b": patch\n---\n\nFix.\n',
    [join('/repo', '.changeset', 'bad.md')]: '---\n"a": patch\n---\n\npr: #3\n',
  };
  const run = (names: string[], config?: unknown) =>
    lintChangesetsCommand({
      root: '/repo',
      list: () => names.map((name) => `.changeset/${name}`),
      read: (file) =>
        file === join('/repo', 'package.json')
          ? JSON.stringify({ repoConfig: config })
          : files[file],
    });

  it('passes clean changesets and counts them', () => {
    expect(run(['ok.md', 'two.md'])).toBe(0);
    expect(log).toHaveBeenCalledWith('lint-changesets: 2 changeset(s) ok');
  });

  it('fails a metadata line, and a second package under singlePackage', () => {
    expect(run(['bad.md'])).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('bad.md:5'));
    expect(run(['two.md'], { changeset: { singlePackage: true } })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('names 2 packages'));
  });

  it('reports a malformed config', () => {
    expect(run([], { changeset: 1 })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('repoConfig.changeset must be'));
  });

  it('reads the working directory by default', () => {
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue('/no/such/repo');
    expect(lintChangesetsCommand()).toBe(0);
    cwd.mockRestore();
  });
});
