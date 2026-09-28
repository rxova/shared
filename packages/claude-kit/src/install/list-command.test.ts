import { rmSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { catalog } from '@/install/catalog';
import { listCommand } from '@/install/list-command';
import { scratchEnv, writeTree } from '@/internal/install/install.fixtures';

const roots: string[] = [];
const scratch = () => {
  const made = scratchEnv();
  roots.push(made.root);
  return made;
};
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
const printed = (out: unknown) =>
  (out as { mock: { calls: string[][] } }).mock.calls.map(([line]) => line).join('\n');

describe('catalog', () => {
  it('reads agents and skills from content, and adds the hooks', () => {
    const { env } = scratch();
    writeTree(env.packageDir, { 'content/agents/notes.txt': '', 'content/skills/empty/.keep': '' });
    const items = catalog(env.packageDir);
    expect(items.slice(0, 4)).toEqual([
      { name: 'rx-pitch', kind: 'agent', summary: 'rx-pitch does a thing' },
      { name: 'rx-planner', kind: 'agent', summary: 'rx-planner does a thing' },
      { name: 'rx-demo', kind: 'skill', summary: 'rx-demo does a thing' },
      { name: 'rx-verify', kind: 'skill', summary: 'rx-verify does a thing' },
    ]);
    expect(items.filter(({ kind }) => kind === 'hook')).toHaveLength(10);
  });

  it('has only hooks when there is no content, and blank summaries without frontmatter', () => {
    const { env } = scratch();
    rmSync(`${env.packageDir}/content`, { recursive: true });
    expect(catalog(env.packageDir).every(({ kind }) => kind === 'hook')).toBe(true);
    writeTree(env.packageDir, {
      'content/agents/rx-bare.md': 'no frontmatter',
      'content/skills/rx-bare/SKILL.md': '---\nname: x\n---\n',
    });
    expect(
      catalog(env.packageDir)
        .slice(0, 2)
        .map(({ summary }) => summary),
    ).toEqual(['', '']);
  });
});

describe('listCommand', () => {
  it('lists every item with the profiles that include it', () => {
    const { env } = scratch();
    expect(listCommand([], env)).toBe(0);
    const out = printed(env.io.out);
    expect(out).toMatch(/agents \(2\)/);
    expect(out).toMatch(/rx-planner +chdf +rx-planner does a thing/);
    expect(out).toMatch(/rx-pitch +·h·f/);
    expect(out).toContain('profiles: c = core');
  });

  it('shows one profile’s items, and shortens long summaries', () => {
    const { env } = scratch();
    writeTree(env.packageDir, {
      'content/agents/rx-pitch.md': `---\nname: rx-pitch\ndescription: ${'y'.repeat(120)}\n---\n`,
    });
    expect(listCommand(['--profile', 'core'], env)).toBe(0);
    expect(printed(env.io.out)).not.toContain('rx-pitch');
    expect(listCommand([], env)).toBe(0);
    expect(printed(env.io.out)).toContain(`${'y'.repeat(87)}…`);
  });

  it('leaves out a kind with nothing to show', () => {
    const { env } = scratch();
    rmSync(`${env.packageDir}/content`, { recursive: true });
    expect(listCommand([], env)).toBe(0);
    expect(printed(env.io.out)).not.toContain('agents (');
  });

  it('rejects an unknown profile or option', () => {
    const { env } = scratch();
    expect(listCommand(['--profile', 'huge'], env)).toBe(1);
    expect(listCommand(['--project'], env)).toBe(1);
  });
});
