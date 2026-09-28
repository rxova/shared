import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { checkTsdocCommand } from '@/tsdoc/check-tsdoc-command';
import { cleanupTsdocRepos, tsdocRepo } from '@/internal/tsdoc/tsdoc-repo.fixtures';

afterAll(cleanupTsdocRepos);

describe('checkTsdocCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  const repo = (index: string, repoConfig?: object) =>
    tsdocRepo({
      'package.json': { repoConfig },
      'packages/a/package.json': { name: 'a' },
      'packages/a/src/index.ts': index,
      // No lib: the program then builds in milliseconds, and callability needs none.
      'packages/a/tsconfig.json': { compilerOptions: { noLib: true, types: [] } },
    });

  it('passes documented exports', () => {
    expect(checkTsdocCommand({ root: repo('/** F. */\nexport const f = () => 1;\n') })).toBe(0);
    expect(log).toHaveBeenCalledWith(
      'check-tsdoc: every callable export of 1 package(s) is documented',
    );
  });

  it('fails an undocumented one, unless excluded', () => {
    expect(checkTsdocCommand({ root: repo('export const f = () => 1;\n') })).toBe(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('  a#f (packages/a/src/index.ts:1)'),
    );
    const excluded = repo('export const f = () => 1;\n', { tsdoc: { exclude: ['f'] } });
    expect(checkTsdocCommand({ root: excluded })).toBe(0);
  });

  it('reports a bad config', () => {
    const root = repo('', { tsdoc: { entries: { a: 'nope.ts' } } });
    expect(checkTsdocCommand({ root })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('which does not exist'));
  });

  it('reads the working directory by default', () => {
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(tsdocRepo({}));
    expect(checkTsdocCommand()).toBe(0);
    cwd.mockRestore();
  });
});
