import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { publishedDirs } from '@/changeset/published-dirs';

const REPO_ROOT = fileURLToPath(new URL('../../../../', import.meta.url));

describe('publishedDirs', () => {
  it('finds the non-private packages of this repository', () => {
    expect(publishedDirs(REPO_ROOT).sort()).toEqual(['ai', 'toolbox', 'tooling']);
  });

  it('leaves a private package out', () => {
    const root = mkdtempSync(join(tmpdir(), 'published-dirs-'));
    try {
      mkdirSync(join(root, 'packages', 'internal'), { recursive: true });
      writeFileSync(join(root, 'packages', 'internal', 'package.json'), '{"private":true}');
      expect(publishedDirs(root)).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('skips a directory without a manifest', () => {
    const root = mkdtempSync(join(tmpdir(), 'published-dirs-'));
    try {
      mkdirSync(join(root, 'packages', 'empty'), { recursive: true });
      mkdirSync(join(root, 'packages', 'lib'));
      writeFileSync(join(root, 'packages', 'lib', 'package.json'), '{"name":"lib"}');
      expect(publishedDirs(root)).toEqual(['lib']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('is empty where there is no packages directory', () => {
    expect(publishedDirs(join(tmpdir(), 'no-such-repo'))).toEqual([]);
  });
});
