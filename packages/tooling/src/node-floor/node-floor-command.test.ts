import {
  fakeWorkspaceFiles,
  manifestWithFloor as pkg,
} from '@rxova-helpers/node-floor/fake-workspace-files.fixtures';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nodeFloorCommand } from '@/node-floor/node-floor-command';

describe('nodeFloorCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  const withOutput = (run: (output: string) => void): string => {
    const dir = mkdtempSync(join(tmpdir(), 'node-floor-'));
    const output = join(dir, 'output');
    try {
      run(output);
      return readFileSync(output, 'utf8');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  it('writes the floor and the package directories as step outputs', () => {
    const fs = fakeWorkspaceFiles({ a: pkg('a', '>=22.13'), b: pkg('b', '>=22.13') });
    const written = withOutput((output) => {
      expect(nodeFloorCommand('/repo', { GITHUB_OUTPUT: output }, { fs })).toBe(0);
    });
    expect(written).toBe('version=22.13\npackages=packages/a packages/b\n');
    expect(log).toHaveBeenCalledWith('node-floor: 22.13 for a, b');
  });

  it('writes an empty floor when nothing is published, so the job skips its steps', () => {
    const written = withOutput((output) => {
      expect(
        nodeFloorCommand('/repo', { GITHUB_OUTPUT: output }, { fs: fakeWorkspaceFiles({}) }),
      ).toBe(0);
    });
    expect(written).toBe('version=\npackages=\n');
    expect(log).toHaveBeenCalledWith('node-floor: no published package, nothing to test');
  });

  it('only prints when there is no step output to write', () => {
    expect(
      nodeFloorCommand('/repo', {}, { fs: fakeWorkspaceFiles({ a: pkg('a', '>=22.13') }) }),
    ).toBe(0);
  });

  it('fails with the reason when the manifests cannot be trusted', () => {
    expect(nodeFloorCommand('/repo', {}, { fs: fakeWorkspaceFiles({ a: pkg('a') }) })).toBe(1);
    expect(error).toHaveBeenCalledWith(
      'node-floor failed — a is published but declares no engines.node',
    );
  });

  it('reads the working directory and the environment by default', () => {
    const empty = mkdtempSync(join(tmpdir(), 'node-floor-empty-'));
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(empty);
    vi.stubEnv('GITHUB_OUTPUT', '');
    try {
      expect(nodeFloorCommand()).toBe(0);
      expect(log).toHaveBeenCalledWith('node-floor: no published package, nothing to test');
    } finally {
      cwd.mockRestore();
      vi.unstubAllEnvs();
      rmSync(empty, { recursive: true, force: true });
    }
  });
});
