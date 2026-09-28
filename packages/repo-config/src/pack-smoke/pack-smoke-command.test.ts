import { fakeNpm, memoryScratch } from '@/internal/pack-smoke/memory-scratch.fixtures';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { packSmokeCommand } from '@/pack-smoke/pack-smoke-command';

describe('packSmokeCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  it('prints the verdict and exits 0', () => {
    const { fs } = memoryScratch({ name: 'x', version: '1.0.0' });
    expect(packSmokeCommand('/pkg', { sh: fakeNpm(), fs })).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('pack:smoke ok'));
  });

  it('prints the failure and exits 1', () => {
    const { fs } = memoryScratch({ name: 'x', version: '1.0.0' }, { tarball: false });
    expect(packSmokeCommand('/pkg', { sh: fakeNpm(), fs })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('pack:smoke failed'));
  });

  it('smokes the working directory by default, which fails without a manifest', () => {
    const empty = mkdtempSync(join(tmpdir(), 'pack-smoke-empty-'));
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(empty);
    try {
      expect(packSmokeCommand()).toBe(1);
    } finally {
      cwd.mockRestore();
      rmSync(empty, { recursive: true, force: true });
    }
  });
});
