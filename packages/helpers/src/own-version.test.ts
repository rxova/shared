import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ownVersion } from './own-version.ts';

describe('ownVersion', () => {
  it('reads the version from the nearest package manifest', () => {
    expect(ownVersion(import.meta.url)).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('throws when there is no manifest above the file', () => {
    expect(() => ownVersion(pathToFileURL('/cli.js').href)).toThrow('no package.json');
  });
});
