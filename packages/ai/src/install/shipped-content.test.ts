import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hooks } from '@/hooks/hooks-table';
import { catalog } from '@/install/catalog';
import { profiles } from '@/install/profiles';
import { packageRoot } from '@/internal/cli/package-root';
import { readFrontmatter } from '@/internal/install/read-frontmatter';

const root = packageRoot(import.meta.url);
const content = join(root, 'content');

describe('the shipped agents', () => {
  it.each(readdirSync(join(content, 'agents')))(
    '%s names itself, says when to use it, and limits its tools and model',
    (file) => {
      const meta = readFrontmatter(join(content, 'agents', file));
      expect(meta.name).toBe(file.replace(/\.md$/, ''));
      expect(meta.name).toMatch(/^rx-[a-z0-9-]+$/);
      expect(meta.description?.length).toBeGreaterThan(40);
      expect(meta.tools).toMatch(/^[A-Z]\w+(, [A-Z]\w+)*$/);
      expect(['haiku', 'sonnet', 'opus']).toContain(meta.model);
    },
  );
});

describe('the shipped skills', () => {
  it.each(readdirSync(join(content, 'skills')))(
    '%s names itself and says when to use it',
    (dir) => {
      const path = join(content, 'skills', dir, 'SKILL.md');
      const meta = readFrontmatter(path);
      expect(meta.name).toBe(dir);
      expect(meta.name).toMatch(/^rx-[a-z0-9-]+$/);
      expect(meta.description?.length).toBeGreaterThan(40);
      expect(readFileSync(path, 'utf8')).toContain('## When to use');
    },
  );
});

describe('the profiles over the real catalog', () => {
  const names = catalog(root).map(({ name }) => name);

  it('lists every agent, skill and hook once', () => {
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(expect.arrayContaining(Object.keys(hooks)));
  });

  it('name only items that exist, and grow from core to full', () => {
    const [core = [], hackathon = [], full = []] = ['core', 'hackathon', 'full'].map((key) =>
      profiles[key]?.(names),
    );
    expect(core.length).toBe(17);
    expect(core.every((name) => hackathon.includes(name))).toBe(true);
    expect(full).toEqual(names);
    expect(hackathon.length).toBeLessThan(full.length);
  });
});
