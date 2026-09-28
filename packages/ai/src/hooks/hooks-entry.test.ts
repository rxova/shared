import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { main } from '@/hooks/hooks-entry';

const bash = (command: string) => JSON.stringify({ tool_name: 'Bash', tool_input: { command } });

describe('main', () => {
  it('runs the named guard over stdin and reports a block on stderr', () => {
    const stderr = vi.fn();
    expect(main(['no-bypass'], () => bash('git commit -n'), stderr)).toBe(2);
    expect(stderr).toHaveBeenCalledWith(expect.stringContaining('no-bypass'));
  });

  it('exits 0 quietly when the call is allowed, stdin fails, or no guard is named', () => {
    const stderr = vi.fn();
    expect(main(['no-bypass'], () => bash('git status'), stderr)).toBe(0);
    expect(
      main(
        ['no-bypass'],
        () => {
          throw new Error('closed');
        },
        stderr,
      ),
    ).toBe(0);
    expect(main([], () => bash('git commit -n'), stderr)).toBe(0);
    expect(stderr).not.toHaveBeenCalled();
  });
});

// Spawning Node with tsx can take several seconds on a cold CI runner.
const SPAWN_TIMEOUT = 60_000;

describe('the runner as a process', () => {
  const script = fileURLToPath(new URL('./hooks-entry.ts', import.meta.url));
  const run = (guard: string, input: string) =>
    spawnSync(process.execPath, ['--import', 'tsx', script, guard], { input, encoding: 'utf8' });

  it(
    'exits 2 with the reason on stderr, or 0',
    () => {
      const blocked = run('no-bypass', bash('git push --no-verify'));
      expect(blocked.status).toBe(2);
      expect(blocked.stderr).toContain('rx-ai no-bypass');
      expect(run('no-bypass', bash('git push')).status).toBe(0);
    },
    SPAWN_TIMEOUT,
  );
});
