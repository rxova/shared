import { mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { realpathOrSelf } from './realpath-or-self.ts';

describe('realpathOrSelf', () => {
  it('follows a symlink to the file it points at', () => {
    const dir = realpathSync(mkdtempSync(join(tmpdir(), 'realpath-')));
    try {
      const target = join(dir, 'cli.js');
      const link = join(dir, 'bin');
      writeFileSync(target, '');
      symlinkSync(target, link);
      expect(realpathOrSelf(link)).toBe(target);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns a path that does not exist as given', () => {
    expect(realpathOrSelf('/no/such/file')).toBe('/no/such/file');
  });
});
