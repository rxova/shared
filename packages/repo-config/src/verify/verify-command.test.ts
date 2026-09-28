import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultSteps } from '@/verify/default-steps';
import { verifyCommand } from '@/verify/verify-command';

const step = (name: string, command = `echo ${name}`) => ({ name, command });

describe('verifyCommand', () => {
  const out = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const err = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  afterEach(() => {
    out.mockClear();
    err.mockClear();
  });

  it('runs the default list when the repository names none', () => {
    const ran: string[] = [];
    const run = (command: string) => void ran.push(command);
    expect(verifyCommand([], { read: () => undefined, run })).toBe(0);
    expect(ran).toEqual(defaultSteps().map(({ command }) => command));
  });

  it('runs the list from package.json#repoConfig.verify.steps', () => {
    const ran: string[] = [];
    const read = () => JSON.stringify({ repoConfig: { verify: { steps: [step('only', 'x')] } } });
    expect(verifyCommand([], { read, run: (command) => void ran.push(command) })).toBe(0);
    expect(ran).toEqual(['x']);
  });

  it('honours --only', () => {
    const ran: string[] = [];
    const run = (command: string) => void ran.push(command);
    verifyCommand(['--only', 'lint'], { read: () => undefined, run });
    expect(ran).toEqual(['pnpm lint']);
  });

  it('fails with the reason when the config or the flags are wrong', () => {
    expect(verifyCommand([], { read: () => '{"repoConfig":{"verify":[]}}', run: () => {} })).toBe(
      1,
    );
    expect(err).toHaveBeenCalledWith(
      expect.stringContaining('repoConfig.verify must be an object'),
    );
    expect(verifyCommand(['--only', 'nope'], { read: () => undefined, run: () => {} })).toBe(1);
  });

  it('reads the working directory and argv by default', () => {
    // No step is named `no-such-step`, so nothing runs and the failure is the flag's.
    const argv = vi.spyOn(process, 'argv', 'get');
    argv.mockReturnValue(['node', 'cli', '--only', 'no-such-step']);
    expect(verifyCommand()).toBe(1);
    argv.mockRestore();
  });
});
