import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { checkBannedCommand } from '@/docs/check-banned-command';

const made: string[] = [];
const repo = (files: Record<string, string>, docs?: object) => {
  const root = mkdtempSync(join(tmpdir(), 'check-banned-'));
  made.push(root);
  writeFileSync(join(root, 'package.json'), JSON.stringify({ repoConfig: docs && { docs } }));
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
  }
  return root;
};

afterAll(() => {
  for (const dir of made) rmSync(dir, { recursive: true, force: true });
});

const DOCS = 'apps/docs/src/content/docs';
const banned = [{ name: 'useApi', pattern: '\\buseApi\\b' }];

describe('checkBannedCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  const files = {
    [`${DOCS}/guide.md`]: 'use useApiX\n',
    [`${DOCS}/core/pre-1-0-migration.md`]: 'useApi became useJourney\n',
    [`${DOCS}/core/releases.md`]: 'removed useApi\n',
    [`${DOCS}/api/reference/x.md`]: 'useApi\n',
    [`${DOCS}/image.png`]: 'useApi',
    'packages/core/package.json': '{}',
    'packages/core/README.md': 'fine\n',
  };

  it('passes docs free of banned names, skipping allowed and excluded pages', () => {
    const root = repo(files, {
      banned,
      allow: ['core/pre-1-0-migration.md', '**/releases.md'],
      exclude: ['**/api/reference/**'],
    });
    expect(checkBannedCommand({ root })).toBe(0);
    expect(log).toHaveBeenCalledWith('check-banned: 2 file(s) free of 1 banned name(s)');
  });

  it('fails a banned name in a doc or a README, with file and line', () => {
    const root = repo(
      { ...files, 'README.md': 'a\nuseApi()\n' },
      { banned, exclude: ['**/api/**'] },
    );
    expect(checkBannedCommand({ root })).toBe(1);
    const message = String(error.mock.calls[0]?.[0]);
    expect(message).toContain('  README.md:2 (useApi)');
    expect(message).toContain(`  ${DOCS}/core/releases.md:1 (useApi)`);
    expect(message).not.toContain('api/reference');
  });

  it('can leave the READMEs out and use another docs root', () => {
    const root = repo(
      { 'README.md': 'useApi', 'site/a.mdx': 'ok' },
      { banned, root: 'site', readmes: false },
    );
    expect(checkBannedCommand({ root })).toBe(0);
    expect(log).toHaveBeenCalledWith('check-banned: 1 file(s) free of 1 banned name(s)');
  });

  it('passes trivially with nothing banned, and reports a bad config', () => {
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(repo({}));
    expect(checkBannedCommand()).toBe(0);
    cwd.mockRestore();
    expect(checkBannedCommand({ root: repo({}, { banned: [{ name: 'x', pattern: '(' }] }) })).toBe(
      1,
    );
  });
});
