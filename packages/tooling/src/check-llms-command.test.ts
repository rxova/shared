import { cleanupLlmsRepos, INDEX, llmsRepo, wellFormed } from '@rxova/helpers/fixtures';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkLlmsCommand } from './check-llms-command.js';

describe('checkLlmsCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
    cleanupLlmsRepos();
  });

  it('prints the verdict and exits 0', () => {
    const root = llmsRepo(
      { lib: { name: 'lib', llms: wellFormed('lib'), index: INDEX } },
      '[lib](packages/lib/llms.txt)',
    );
    expect(checkLlmsCommand(root)).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('check:llms ok'));
  });

  it('prints the failures and exits 1', () => {
    expect(checkLlmsCommand(llmsRepo({ lib: { name: 'lib' } }))).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('has no llms.txt'));
  });

  it('checks the working directory by default', () => {
    const root = llmsRepo({ lib: { name: 'lib', private: true } }, '');
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(root);
    expect(checkLlmsCommand()).toBe(0);
    cwd.mockRestore();
  });
});
