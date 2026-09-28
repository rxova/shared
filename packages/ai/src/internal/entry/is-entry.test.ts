import { mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { isEntry } from '@/internal/entry/is-entry';

// Real path: on macOS the temp directory itself sits behind a symlink.
const dir = realpathSync(mkdtempSync(join(tmpdir(), 'rx-ai-entry-')));
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('isEntry', () => {
  it('matches the started script, through a symlink too', () => {
    const script = join(dir, 'cli.js');
    writeFileSync(script, '');
    const link = join(dir, 'bin');
    symlinkSync(script, link);
    const url = pathToFileURL(script).href;
    expect(isEntry(url, script)).toBe(true);
    expect(isEntry(url, link)).toBe(true);
  });

  it('is false for another script, a missing path or none', () => {
    const url = pathToFileURL(join(dir, 'cli.js')).href;
    expect(isEntry(url, join(dir, 'missing.js'))).toBe(false);
    expect(isEntry(url, '')).toBe(false);
    expect(isEntry(url, undefined)).toBe(false);
    expect(isEntry(url)).toBe(false);
  });
});
