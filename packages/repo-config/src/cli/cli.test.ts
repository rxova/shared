import { usage } from '@/internal/cli/usage';
import type { CommandEntry } from '@/cli/cli.types';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { cli } from '@/cli/cli';
import { commands } from '@/cli/commands';

const io = () => ({ out: vi.fn(), err: vi.fn() });

describe('cli', () => {
  it('hands the arguments after the name to the command and returns its code', async () => {
    const command = vi.fn(() => 3);
    const table: Record<string, CommandEntry> = {
      go: { summary: 'go', load: () => Promise.resolve(command) },
    };
    expect(await cli(['go', 'a', 'b'], { table, io: io() })).toBe(3);
    expect(command).toHaveBeenCalledWith(['a', 'b']);
  });

  it('prints the version, its own by default', async () => {
    const streams = io();
    expect(await cli(['--version'], { io: streams, version: () => '1.2.3' })).toBe(0);
    expect(await cli(['-v'], { io: streams, version: () => '1.2.3' })).toBe(0);
    expect(streams.out).toHaveBeenCalledWith('1.2.3');
    await cli(['--version'], { io: streams });
    expect(streams.out).toHaveBeenLastCalledWith(expect.stringMatching(/^\d+\.\d+\.\d+/));
  });

  it('prints usage with no command, or when asked', async () => {
    const streams = io();
    expect(await cli([], { io: streams })).toBe(0);
    expect(await cli(['--help'], { io: streams })).toBe(0);
    expect(await cli(['-h'], { io: streams })).toBe(0);
    expect(streams.out).toHaveBeenCalledWith(usage(commands()));
  });

  it('refuses an unknown command, including an inherited property name', async () => {
    const streams = io();
    expect(await cli(['nope'], { io: streams })).toBe(1);
    expect(await cli(['toString'], { io: streams })).toBe(1);
    expect(streams.err).toHaveBeenCalledWith(expect.stringContaining('unknown command "nope"'));
  });

  it('writes to the console by default', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await cli(['--help']);
    await cli(['nope']);
    expect(log).toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
    log.mockRestore();
    error.mockRestore();
  });
});

// Each case spawns a Node that loads tsx and the CLI graph; on a cold Windows
// runner that alone can take longer than vitest's default five seconds.
const SPAWN_TIMEOUT = 60_000;

describe('the bin', () => {
  const script = fileURLToPath(new URL('./cli.ts', import.meta.url));
  const root = fileURLToPath(new URL('../../../../', import.meta.url));
  const exec = (args: string[], env: NodeJS.ProcessEnv = {}) =>
    execFileSync(process.execPath, ['--import', 'tsx', script, ...args], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, ...env },
    });

  it(
    'prints a verdict when run as a script',
    () => {
      const out = exec(['check-scope'], { BASE_SHA: '', HEAD_SHA: '', GITHUB_OUTPUT: '' });
      expect(out).toContain('code-changed=true');
    },
    SPAWN_TIMEOUT,
  );

  it(
    'reads this repository and prints its floor',
    () => {
      expect(exec(['node-floor'], { GITHUB_OUTPUT: '' })).toMatch(/^node-floor: /);
    },
    SPAWN_TIMEOUT,
  );

  it(
    'sets the process exit code from the command',
    () => {
      let status = 0;
      try {
        // No range in the environment: the one failure that needs no repository.
        exec(['check-changeset'], { BASE_SHA: '', HEAD_SHA: '' });
      } catch (failure) {
        status = (failure as { status: number }).status;
      }
      expect(status).toBe(1);
    },
    SPAWN_TIMEOUT,
  );
});
