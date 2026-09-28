import { describe, expect, it } from 'vitest';
import { resolveTargets } from '@/install/resolve-targets';

const env = { home: '/home/me', cwd: '/work/app', configHome: '/home/me/.config' };

describe('resolveTargets', () => {
  it('resolves each tool’s user and project directories', () => {
    expect(resolveTargets('both', false, env)).toEqual([
      { kind: 'claude', root: '/home/me/.claude' },
      { kind: 'opencode', root: '/home/me/.config/opencode' },
    ]);
    expect(resolveTargets('opencode', true, env)).toEqual([
      { kind: 'opencode', root: '/work/app/.opencode' },
    ]);
    expect(resolveTargets('claude', true, env)).toEqual([
      { kind: 'claude', root: '/work/app/.claude' },
    ]);
  });

  it('rejects an unknown target, and relative directories', () => {
    expect(() => resolveTargets('cursor', false, env)).toThrow('claude, opencode or both');
    expect(() => resolveTargets('opencode', false, { ...env, configHome: '' })).toThrow(
      'no config directory',
    );
    expect(() => resolveTargets('opencode', true, { ...env, cwd: 'rel' })).toThrow(
      'not an absolute path',
    );
  });
});
