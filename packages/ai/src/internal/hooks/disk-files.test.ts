import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { diskFiles } from '@/internal/hooks/disk-files';

const dir = mkdtempSync(join(tmpdir(), 'rx-ai-disk-'));
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('diskFiles', () => {
  it('reads files that exist and reports the ones that do not', () => {
    const file = join(dir, 'a.txt');
    writeFileSync(file, 'hello');
    expect(diskFiles.exists(file)).toBe(true);
    expect(diskFiles.read(file)).toBe('hello');
    expect(diskFiles.exists(join(dir, 'b.txt'))).toBe(false);
    expect(diskFiles.read(join(dir, 'b.txt'))).toBeUndefined();
  });
});
