import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { packInto } from './pack-into.ts';

describe('packInto', () => {
  it('asks npm for a JSON report and returns where the tarball landed', () => {
    const sh = vi.fn(() => JSON.stringify([{ filename: 'scope-core-0.0.0.tgz' }]));
    expect(packInto('/core', '/scratch', sh)).toBe(join('/scratch', 'scope-core-0.0.0.tgz'));
    expect(sh).toHaveBeenCalledWith(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', '/scratch'],
      '/core',
    );
  });

  it('throws when npm packed nothing', () => {
    expect(() => packInto('/core', '/scratch', () => '[]')).toThrow(
      'npm pack produced no tarball for /core',
    );
  });
});
