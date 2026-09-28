import { rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { installCommand } from '@/install/install-command';
import { scratchEnv, writeTree } from '@/internal/install/install.fixtures';
import { statusCommand } from '@/install/status-command';

const roots: string[] = [];
const scratch = () => {
  const made = scratchEnv();
  roots.push(made.root);
  return made;
};
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('statusCommand', () => {
  it('passes right after an install', () => {
    const { env } = scratch();
    installCommand([], env);
    expect(statusCommand([], env)).toBe(0);
    expect(env.io.out).toHaveBeenCalledWith(expect.stringContaining('3 guard hooks registered'));
  });

  it('fails when nothing is installed', () => {
    const { env } = scratch();
    expect(statusCommand(['--project'], env)).toBe(1);
  });

  it('lists missing and changed files, and fails', () => {
    const { env, target } = scratch();
    installCommand([], env);
    rmSync(join(target, 'agents/rx-one.md'));
    writeFileSync(join(target, 'agents/rx-two.md'), 'edited');
    expect(statusCommand([], env)).toBe(1);
    expect(env.io.out).toHaveBeenCalledWith('  missing  agents/rx-one.md');
    expect(env.io.out).toHaveBeenCalledWith('  changed  agents/rx-two.md');
  });

  it('fails on another version, or when the hooks are gone', () => {
    const { env, target } = scratch();
    installCommand([], env);
    writeTree(env.packageDir, { 'package.json': JSON.stringify({ version: '2.0.0' }) });
    expect(statusCommand([], env)).toBe(1);
    writeTree(env.packageDir, { 'package.json': JSON.stringify({ version: '1.0.0' }) });
    writeFileSync(join(target, 'settings.json'), '{}');
    expect(statusCommand([], env)).toBe(1);
  });

  it('does not flag a file this version no longer ships as changed', () => {
    const { env } = scratch();
    installCommand([], env);
    rmSync(join(env.packageDir, 'content/agents/rx-one.md'));
    expect(statusCommand([], env)).toBe(0);
  });

  it('stops on an unknown option or unreadable settings', () => {
    const { env, target } = scratch();
    expect(statusCommand(['-x'], env)).toBe(1);
    installCommand([], env);
    writeFileSync(join(target, 'settings.json'), 'nope');
    expect(statusCommand([], env)).toBe(1);
  });
});
