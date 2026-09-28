import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { installCommand } from '@/install/install-command';
import { scratchEnv, writeTree } from '@/internal/install/install.fixtures';

const roots: string[] = [];
const scratch = (version?: string) => {
  const made = scratchEnv(version);
  roots.push(made.root);
  return made;
};
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
const json = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;

describe('installCommand', () => {
  it('copies the content and runner, registers the guards and writes a manifest', () => {
    const { env, target } = scratch();
    expect(installCommand([], env)).toBe(0);
    expect(readFileSync(join(target, 'agents/rx-one.md'), 'utf8')).toBe('one');
    expect(readFileSync(join(target, 'skills/rx-skill/notes/extra.md'), 'utf8')).toBe('extra');
    expect(readFileSync(join(target, 'rx-ai/hooks.js'), 'utf8')).toBe('// runner');
    expect(json(join(target, 'rx-ai/manifest.json'))).toEqual({
      version: '1.0.0',
      files: [
        'agents/rx-one.md',
        'agents/rx-two.md',
        'skills/rx-skill/SKILL.md',
        'skills/rx-skill/notes/extra.md',
        'rx-ai/hooks.js',
      ],
    });
    const settings = JSON.stringify(json(join(target, 'settings.json')));
    for (const guard of ['no-bypass', 'no-attribution', 'config-lock'])
      expect(settings).toContain(guard);
    expect(env.io.out).toHaveBeenCalledWith(expect.stringContaining('5 files'));
  });

  it('keeps the settings it did not write, and does not duplicate its hooks on a rerun', () => {
    const { env, target } = scratch();
    const other = { matcher: 'Bash', hooks: [{ type: 'command', command: 'mine.sh' }] };
    writeTree(target, {
      'settings.json': JSON.stringify({ model: 'x', hooks: { PreToolUse: [other] } }),
    });
    installCommand([], env);
    installCommand([], env);
    const settings = json(join(target, 'settings.json'));
    expect(settings.model).toBe('x');
    const pre = (settings.hooks as Record<string, unknown[]>).PreToolUse ?? [];
    expect(pre[0]).toEqual(other);
    expect(pre).toHaveLength(3);
  });

  it('installs into the project with --project', () => {
    const { env } = scratch();
    expect(installCommand(['--project'], env)).toBe(0);
    expect(existsSync(join(env.cwd, '.claude/agents/rx-two.md'))).toBe(true);
  });

  it('refuses to overwrite files it did not write, unless forced', () => {
    const { env, target } = scratch();
    writeTree(target, { 'agents/rx-one.md': 'someone else' });
    expect(installCommand([], env)).toBe(1);
    expect(env.io.err).toHaveBeenCalledWith(expect.stringContaining('agents/rx-one.md'));
    expect(readFileSync(join(target, 'agents/rx-one.md'), 'utf8')).toBe('someone else');
    expect(installCommand(['--force'], env)).toBe(0);
    expect(readFileSync(join(target, 'agents/rx-one.md'), 'utf8')).toBe('one');
  });

  it('updates in place, removing what the new version no longer ships', () => {
    const { env, target } = scratch();
    installCommand([], env);
    rmSync(join(env.packageDir, 'content/agents/rx-two.md'));
    writeTree(env.packageDir, { 'content/agents/rx-one.md': 'one, revised' });
    expect(installCommand([], env)).toBe(0);
    expect(readFileSync(join(target, 'agents/rx-one.md'), 'utf8')).toBe('one, revised');
    expect(existsSync(join(target, 'agents/rx-two.md'))).toBe(false);
  });

  it('prints the plan and writes nothing with --dry-run', () => {
    const { env, target } = scratch();
    installCommand([], env);
    rmSync(join(env.packageDir, 'content/agents/rx-two.md'));
    expect(installCommand(['--dry-run'], env)).toBe(0);
    expect(env.io.out).toHaveBeenCalledWith('  remove  agents/rx-two.md');
    expect(env.io.out).toHaveBeenCalledWith('  write   agents/rx-one.md');
    expect(existsSync(join(target, 'agents/rx-two.md'))).toBe(true);
  });

  it('stops on an unknown option, an unbuilt package or unreadable settings', () => {
    const { env, target } = scratch();
    expect(installCommand(['--nope'], env)).toBe(1);
    writeTree(target, { 'settings.json': '{ not json' });
    expect(installCommand([], env)).toBe(1);
    expect(env.io.err).toHaveBeenCalledWith(expect.stringContaining('not valid JSON'));
    writeFileSync(join(target, 'settings.json'), '[]');
    expect(installCommand([], env)).toBe(1);
    rmSync(join(env.packageDir, 'dist/hooks.js'));
    expect(installCommand([], env)).toBe(1);
    expect(env.io.err).toHaveBeenLastCalledWith(expect.stringContaining('build the package'));
  });
});
