import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkFileSizeCommand } from '@/size/check-file-size-command';

describe('checkFileSizeCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  const lines = (count: number) => 'x\n'.repeat(count);
  const run = (files: Record<string, string>, fileSize?: object) =>
    checkFileSizeCommand({
      root: '/repo',
      list: () => Object.keys(files),
      read: (file) =>
        file === join('/repo', 'package.json')
          ? JSON.stringify({ repoConfig: fileSize && { fileSize } })
          : files[file.slice(join('/repo', '/').length).replaceAll('\\', '/')],
    });

  it('passes files within the limit, skipping other extensions and ignored names', () => {
    const files = {
      'a.ts': lines(500),
      'README.md': lines(900),
      'pnpm-lock.yaml': lines(9000),
      'deleted.ts': undefined as unknown as string,
    };
    expect(run(files)).toBe(0);
    expect(log).toHaveBeenCalledWith('check-file-size: 1 file(s) within 500 lines');
  });

  it('fails a file over the limit, and an allowed file that fits again', () => {
    expect(run({ 'src/big.ts': lines(501) })).toBe(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('  src/big.ts: 501 lines (limit 500)'),
    );
    expect(run({ 'a.ts': lines(10) }, { max: 5, allow: ['a.ts'] })).toBe(0);
    expect(run({ 'a.ts': lines(10) }, { max: 20, allow: ['a.ts'], extensions: ['ts'] })).toBe(1);
    expect(error).toHaveBeenLastCalledWith(
      expect.stringContaining('remove it from repoConfig.fileSize.allow'),
    );
    expect(
      run({ 'a.ts': lines(10), 'b.md': lines(10) }, { max: 20, ignore: [], extensions: ['md'] }),
    ).toBe(0);
  });

  it('reports a bad config', () => {
    expect(run({}, { max: -1 })).toBe(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('fileSize.max must be a positive integer'),
    );
  });

  it('reads the working tree by default', () => {
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue('/no/such/repo');
    expect(checkFileSizeCommand()).toBe(1);
    cwd.mockRestore();
  });
});
