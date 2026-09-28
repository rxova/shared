import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packageRoot } from '@/internal/cli/package-root';

const content = join(packageRoot(import.meta.url), 'content');

/** The `key: value` lines between a file's opening `---` fences. */
const frontmatter = (path: string): Record<string, string> => {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(readFileSync(path, 'utf8'));
  if (!match?.[1]) return {};
  return Object.fromEntries(
    match[1].split('\n').map((line) => {
      const colon = line.indexOf(':');
      return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
    }),
  );
};

describe('the shipped agents', () => {
  const agents = readdirSync(join(content, 'agents'));

  it.each(agents)(
    '%s names itself, says when to use it, and limits its tools and model',
    (file) => {
      const meta = frontmatter(join(content, 'agents', file));
      expect(meta.name).toBe(file.replace(/\.md$/, ''));
      expect(meta.name).toMatch(/^rx-[a-z-]+$/);
      expect(meta.description?.length).toBeGreaterThan(40);
      expect(meta.tools).toMatch(/^[A-Z]\w+(, [A-Z]\w+)*$/);
      expect(['haiku', 'sonnet', 'opus']).toContain(meta.model);
    },
  );
});

describe('the shipped skills', () => {
  const skills = readdirSync(join(content, 'skills'));

  it.each(skills)('%s names itself and says when to use it', (dir) => {
    const path = join(content, 'skills', dir, 'SKILL.md');
    const meta = frontmatter(path);
    expect(meta.name).toBe(dir);
    expect(meta.name).toMatch(/^rx-[a-z-]+$/);
    expect(meta.description?.length).toBeGreaterThan(40);
    expect(readFileSync(path, 'utf8')).toContain('## When to use');
  });
});
