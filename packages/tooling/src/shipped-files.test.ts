import { describe, expect, it } from 'vitest';
import { shippedFiles } from './shipped-files.js';

describe('shippedFiles', () => {
  it('always wants the license and the README', () => {
    expect(shippedFiles({ name: 'x', version: '1.0.0' })).toEqual(['LICENSE', 'README.md']);
  });

  it('adds every other `files` entry, leaving dist to the probe', () => {
    expect(shippedFiles({ name: 'x', version: '1.0.0', files: ['dist', 'schema.json'] })).toEqual([
      'LICENSE',
      'README.md',
      'schema.json',
    ]);
  });
});
