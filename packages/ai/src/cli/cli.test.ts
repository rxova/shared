import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { CommandEntry } from '@/cli/cli.types';
import { cli } from '@/cli/cli';
import { commands } from '@/cli/commands';
import { usage } from '@/internal/cli/usage';

const io = () => ({ out: vi.fn(), err: vi.fn() });

describe('cli', () => {
  it('hands the rest of the arguments to the command and returns its code', async () => {
    const command = vi.fn(() => 4);
    const table: Record<string, CommandEntry> = {
      go: { summary: 'go', load: () => Promise.resolve(command) },
    };
    expect(await cli(['go', '--x'], { table, io: io() })).toBe(4);
    expect(command).toHaveBeenCalledWith(['--x']);
  });

  it('prints the version, this package’s by default', async () => {
    const streams = io();
    expect(await cli(['-v'], { io: streams, version: () => '9.9.9' })).toBe(0);
    expect(streams.out).toHaveBeenCalledWith('9.9.9');
    await cli(['--version'], { io: streams });
    expect(streams.out).toHaveBeenLastCalledWith(expect.stringMatching(/^\d+\.\d+\.\d+/));
  });

  it('prints usage with no command or when asked', async () => {
    const streams = io();
    for (const argv of [[], ['--help'], ['-h']]) expect(await cli(argv, { io: streams })).toBe(0);
    expect(streams.out).toHaveBeenCalledWith(usage(commands()));
  });

  it('refuses an unknown command, including an inherited name', async () => {
    const streams = io();
    expect(await cli(['nope'], { io: streams })).toBe(1);
    expect(await cli(['constructor'], { io: streams })).toBe(1);
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

describe('commands', () => {
  it('loads each command, which reports an unknown option', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    for (const [name, entry] of Object.entries(commands())) {
      const command = await entry.load();
      expect(await command(['--not-an-option'])).toBe(1);
      expect(error).toHaveBeenLastCalledWith(expect.stringContaining(`rxova-ai ${name}`));
    }
    error.mockRestore();
  });
});

// Spawning Node with tsx can take several seconds on a cold CI runner.
const SPAWN_TIMEOUT = 60_000;

describe('the bin', () => {
  it(
    'runs as a script',
    () => {
      const script = fileURLToPath(new URL('./cli.ts', import.meta.url));
      const out = execFileSync(process.execPath, ['--import', 'tsx', script, '--help'], {
        encoding: 'utf8',
      });
      expect(out).toContain('usage: rxova-ai');
    },
    SPAWN_TIMEOUT,
  );
});
