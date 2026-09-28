import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { installCommand } from '@/install/install-command';
import { scratchEnv, writeTree } from '@/internal/install/install.fixtures';
import { uninstallCommand } from '@/install/uninstall-command';

const roots: string[] = [];
const scratch = () => {
  const made = scratchEnv();
  roots.push(made.root);
  return made;
};
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('uninstallCommand', () => {
  it('puts the directory back the way it was before the install', () => {
    const { env, target } = scratch();
    writeTree(target, {
      'agents/theirs.md': 'theirs',
      'settings.json': `${JSON.stringify({ model: 'x' }, null, 2)}\n`,
    });
    installCommand([], env);
    writeTree(target, { 'rx-ai/state/nudge-s1.json': '1' });
    expect(uninstallCommand([], env)).toBe(0);
    expect(readdirSync(target).sort()).toEqual(['agents', 'settings.json']);
    expect(readdirSync(join(target, 'agents'))).toEqual(['theirs.md']);
    expect(JSON.parse(readFileSync(join(target, 'settings.json'), 'utf8'))).toEqual({ model: 'x' });
  });

  it('removes settings.json too when the install created it and nothing else is left in it', () => {
    const { env, target } = scratch();
    installCommand([], env);
    installCommand(['--add', 'rx-pitch'], env);
    expect(uninstallCommand([], env)).toBe(0);
    expect(readdirSync(target)).toEqual([]);
  });

  it('keeps a created settings.json that has gained other settings', () => {
    const { env, target } = scratch();
    installCommand([], env);
    const settings = JSON.parse(readFileSync(join(target, 'settings.json'), 'utf8')) as object;
    writeTree(target, { 'settings.json': JSON.stringify({ ...settings, model: 'x' }) });
    expect(uninstallCommand([], env)).toBe(0);
    expect(JSON.parse(readFileSync(join(target, 'settings.json'), 'utf8'))).toEqual({ model: 'x' });
  });

  it('removes hook entries left behind without a manifest', () => {
    const { env, target } = scratch();
    installCommand([], env);
    rmSync(join(target, 'rx-ai'), { recursive: true });
    expect(uninstallCommand([], env)).toBe(0);
    expect(readFileSync(join(target, 'settings.json'), 'utf8')).toBe('{}\n');
  });

  it('leaves settings alone when the hooks are already gone', () => {
    const { env, target } = scratch();
    installCommand([], env);
    writeTree(target, { 'settings.json': '{"model":"x"}' });
    expect(uninstallCommand(['--dry-run'], env)).toBe(0);
    expect(env.io.out).not.toHaveBeenCalledWith(expect.stringContaining('drop the rx-ai hooks'));
    expect(uninstallCommand([], env)).toBe(0);
    expect(readFileSync(join(target, 'settings.json'), 'utf8')).toBe('{"model":"x"}');
    expect(existsSync(join(target, 'rx-ai'))).toBe(false);
  });

  it('reports when there is nothing to remove', () => {
    const { env } = scratch();
    expect(uninstallCommand([], env)).toBe(0);
    expect(env.io.out).toHaveBeenCalledWith(expect.stringContaining('not installed'));
  });

  it('lists what it would remove with --dry-run, and removes nothing', () => {
    const { env, target } = scratch();
    installCommand(['--project'], env);
    expect(uninstallCommand(['--project', '--dry-run'], env)).toBe(0);
    expect(env.io.out).toHaveBeenCalledWith('  remove  agents/rx-planner.md');
    expect(env.io.out).toHaveBeenCalledWith(expect.stringContaining('drop the rx-ai hooks'));
    expect(existsSync(join(env.cwd, '.claude/agents/rx-planner.md'))).toBe(true);
    expect(existsSync(target)).toBe(false);
  });

  it('stops on an unknown option or unreadable settings', () => {
    const { env, target } = scratch();
    expect(uninstallCommand(['--force'], env)).toBe(1);
    writeTree(target, { 'settings.json': '{' });
    expect(uninstallCommand([], env)).toBe(1);
  });
});
