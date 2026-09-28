import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { liveContext } from '@/internal/hooks/live-context';

const dir = mkdtempSync(join(tmpdir(), 'rx-ai-live-'));
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('liveContext', () => {
  const context = liveContext(join(dir, 'state'));

  it('writes, reads, lists and removes files', () => {
    const file = join(dir, 'deep', 'a.txt');
    context.write(file, 'hello');
    expect(context.exists(file)).toBe(true);
    expect(context.read(file)).toBe('hello');
    expect(context.list(join(dir, 'deep'))).toEqual(['a.txt']);
    context.remove(file);
    expect(context.exists(file)).toBe(false);
    expect(context.read(file)).toBeUndefined();
    expect(context.list(join(dir, 'missing'))).toEqual([]);
  });

  it('runs programs, and reports one that cannot start', () => {
    expect(context.run(process.execPath, ['-e', 'process.stdout.write("hi")'], dir)).toEqual({
      status: 0,
      stdout: 'hi',
      stderr: '',
    });
    expect(context.run('rx-ai-no-such-program', [], dir).status).toBeNull();
  });

  it('carries the real environment, clock, platform and state directory', () => {
    expect(context.env).toBe(process.env);
    expect(context.now()).toBeInstanceOf(Date);
    expect(context.platform).toBe(process.platform);
    expect(context.stateDir).toBe(join(dir, 'state'));
    expect(liveContext().stateDir).toMatch(/rx-ai[\\/]state$/);
  });
});
