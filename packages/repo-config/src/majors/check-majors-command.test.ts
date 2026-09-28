import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { checkMajorsCommand } from '@/majors/check-majors-command';

const made: string[] = [];
const repo = (packages: Record<string, object>, repoConfig?: object) => {
  const root = mkdtempSync(join(tmpdir(), 'check-majors-'));
  made.push(root);
  writeFileSync(join(root, 'package.json'), JSON.stringify({ repoConfig }));
  for (const [dir, manifest] of Object.entries(packages)) {
    mkdirSync(join(root, 'packages', dir), { recursive: true });
    writeFileSync(join(root, 'packages', dir, 'package.json'), JSON.stringify(manifest));
  }
  return root;
};

afterAll(() => {
  for (const dir of made) rmSync(dir, { recursive: true, force: true });
});

describe('checkMajorsCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  const packages = {
    core: { name: 'core', version: '2.1.0' },
    react: { name: 'react', version: '2.0.0-rc.1' },
    common: { name: 'common', version: '0.0.0', private: true },
  };

  it('passes packages on one major, private ones aside', () => {
    expect(checkMajorsCommand({ root: repo(packages) })).toBe(0);
    expect(log).toHaveBeenCalledWith('check-majors: 2 package(s) on major 2');
  });

  it('fails packages on different majors and lists them', () => {
    const root = repo({ ...packages, tools: { name: 'tools', version: '1.0.0' } });
    expect(checkMajorsCommand({ root })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('  tools@1.0.0'));
  });

  it('checks only the packages the config names, and refuses one it cannot find', () => {
    const root = repo(
      { ...packages, tools: { version: '1.0.0' } },
      { majors: { packages: ['core', 'react'] } },
    );
    expect(checkMajorsCommand({ root })).toBe(0);
    const typo = repo(packages, { majors: { packages: ['cor'] } });
    expect(checkMajorsCommand({ root: typo })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('names cor'));
  });

  it('fails a package without a semver version, and passes an empty repository', () => {
    expect(checkMajorsCommand({ root: repo({ x: { name: 'x' } }) })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('x has no semver version'));
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(repo({}));
    expect(checkMajorsCommand()).toBe(0);
    expect(log).toHaveBeenCalledWith('check-majors: 0 package(s) on major none');
    cwd.mockRestore();
  });
});
