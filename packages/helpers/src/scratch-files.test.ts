import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scratchFiles } from './scratch-files.ts';

describe('scratchFiles', () => {
  it('makes, writes, reads, lists and removes a scratch directory', () => {
    const dir = scratchFiles.make();
    const file = join(dir, 'a.txt');
    scratchFiles.write(file, 'hello');
    expect(scratchFiles.read(file)).toBe('hello');
    expect(scratchFiles.list(dir)).toEqual(['a.txt']);
    mkdirSync(join(dir, 'nested'));
    scratchFiles.remove(dir);
    expect(existsSync(dir)).toBe(false);
    expect(() => readFileSync(file)).toThrow();
  });
});
