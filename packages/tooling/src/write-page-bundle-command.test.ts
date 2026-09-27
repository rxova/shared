import { PAGE_BUNDLE_FILENAME } from '@rxova/helpers';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { pageBundleManifest } from './page-bundle-manifest.js';
import { writePageBundleCommand } from './write-page-bundle-command.js';

describe('writePageBundleCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  it('writes the manifest into dist', () => {
    const write = vi.fn();
    expect(
      writePageBundleCommand(['dist', 'x', '/packages/x/'], { write, exists: () => true }),
    ).toBe(0);
    expect(write).toHaveBeenCalledWith(
      join('dist', PAGE_BUNDLE_FILENAME),
      `${JSON.stringify(pageBundleManifest('x', '/packages/x/'), null, 2)}\n`,
    );
  });

  it('prints usage without three arguments, reading argv by default', () => {
    expect(writePageBundleCommand(['dist', 'x'])).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('usage:'));
    const argv = vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli']);
    expect(writePageBundleCommand()).toBe(1);
    argv.mockRestore();
  });

  it('fails when dist is missing, or a value is rejected', () => {
    expect(writePageBundleCommand(['dist', 'x', '/packages/x/'], { exists: () => false })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('build the docs first'));
    expect(writePageBundleCommand(['dist', 'X', '/packages/x/'], { exists: () => true })).toBe(1);
  });
});
