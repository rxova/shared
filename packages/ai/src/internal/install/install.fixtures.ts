import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { vi } from 'vitest';
import type { InstallEnv } from '@/install/install.types';

/** Writes `files` (relative paths to contents) under `root`. */
export const writeTree = (root: string, files: Record<string, string>): void => {
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
  }
};

/**
 * A scratch home, project and built package: two agents, a skill with a supporting file, and
 * the hook runner. The io records what the command printed.
 */
export const scratchEnv = (version = '1.0.0') => {
  const root = mkdtempSync(join(tmpdir(), 'rx-ai-install-'));
  const packageDir = join(root, 'pkg');
  writeTree(packageDir, {
    'package.json': JSON.stringify({ version }),
    'content/agents/rx-one.md': 'one',
    'content/agents/rx-two.md': 'two',
    'content/skills/rx-skill/SKILL.md': 'skill',
    'content/skills/rx-skill/notes/extra.md': 'extra',
    'dist/hooks.js': '// runner',
  });
  const env: InstallEnv = {
    home: join(root, 'home'),
    cwd: join(root, 'project'),
    packageDir,
    io: { out: vi.fn(), err: vi.fn() },
  };
  return { root, env, target: join(root, 'home', '.claude') };
};
