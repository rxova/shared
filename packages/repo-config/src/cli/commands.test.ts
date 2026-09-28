import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { commands } from '@/cli/commands';

describe('commands', () => {
  const quiet = () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  };
  const empty = mkdtempSync(join(tmpdir(), 'commands-'));

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  const call = async (name: string, argv: string[] = []) => {
    const entry = commands()[name];
    if (entry === undefined) throw new Error(`no command ${name}`);
    return (await entry.load())(argv);
  };

  // Each command is driven down a path that does no real work, which proves
  // the name reaches the right module with the right arguments.
  it('verify rejects an unknown --only before running anything', async () => {
    quiet();
    expect(await call('verify', ['--only', 'no-such-step'])).toBe(1);
  });

  it('check-changeset needs a range', async () => {
    quiet();
    vi.stubEnv('BASE_SHA', '');
    expect(await call('check-changeset')).toBe(1);
  });

  it('check-scope runs everything without a range', async () => {
    quiet();
    vi.stubEnv('BASE_SHA', '');
    vi.stubEnv('GITHUB_OUTPUT', '');
    expect(await call('check-scope')).toBe(0);
  });

  it('node-floor finds nothing published outside a workspace', async () => {
    quiet();
    vi.stubEnv('GITHUB_OUTPUT', '');
    vi.spyOn(process, 'cwd').mockReturnValue(empty);
    expect(await call('node-floor')).toBe(0);
  });

  it('pack-smoke fails on a directory with no manifest', async () => {
    quiet();
    expect(await call('pack-smoke', [empty])).toBe(1);
  });

  it('check-llms checks the root it is given', async () => {
    quiet();
    expect(await call('check-llms', [empty])).toBe(1);
  });

  it.each(Object.keys(commands()))('%s has a summary', (name) => {
    expect(commands()[name]?.summary).toBeTruthy();
  });

  afterAll(() => {
    rmSync(empty, { recursive: true, force: true });
  });
});
