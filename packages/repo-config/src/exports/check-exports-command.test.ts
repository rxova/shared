import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkExportsCommand } from '@/exports/check-exports-command';

describe('checkExportsCommand', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    error.mockClear();
  });

  const manifest = (repoConfig?: object) => (file: string) =>
    file === join('/pkg', 'package.json') ? JSON.stringify({ name: 'x', repoConfig }) : undefined;

  it('runs publint, then attw with the package profile', () => {
    const run = vi.fn();
    expect(
      checkExportsCommand([], {
        cwd: '/pkg',
        run,
        read: manifest({ exports: { profile: 'esm-only' } }),
      }),
    ).toBe(0);
    expect(run.mock.calls).toEqual([['publint --strict'], ['attw --pack . --profile esm-only']]);
  });

  it('runs attw with no profile when none is set, and lets the flag win', () => {
    const run = vi.fn();
    checkExportsCommand([], { cwd: '/pkg', run, read: manifest() });
    expect(run).toHaveBeenLastCalledWith('attw --pack .');
    checkExportsCommand(['--profile', 'node16'], {
      cwd: '/pkg',
      run,
      read: manifest({ exports: { profile: 'esm-only' } }),
    });
    expect(run).toHaveBeenLastCalledWith('attw --pack . --profile node16');
    checkExportsCommand(['--profile=strict'], { cwd: '/pkg', run, read: manifest() });
    expect(run).toHaveBeenLastCalledWith('attw --pack . --profile strict');
  });

  it('refuses a profile that is not a name, and reports a failing tool', () => {
    const run = vi.fn();
    expect(checkExportsCommand(['--profile'], { cwd: '/pkg', run, read: manifest() })).toBe(1);
    expect(checkExportsCommand(['--profile=x;rm'], { cwd: '/pkg', run, read: manifest() })).toBe(1);
    expect(run).not.toHaveBeenCalled();
    const failing = () => {
      throw new Error('publint found 1 error');
    };
    expect(checkExportsCommand([], { cwd: '/pkg', run: failing, read: manifest() })).toBe(1);
    expect(error).toHaveBeenLastCalledWith('check-exports failed — publint found 1 error');
  });

  it('reads the working directory by default', () => {
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue('/no/such/pkg');
    const run = vi.fn();
    expect(checkExportsCommand(undefined, { run })).toBe(0);
    cwd.mockRestore();
  });
});
