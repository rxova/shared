import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { listPackagesCommand } from '@/packages/list-packages-command';

const root = mkdtempSync(join(tmpdir(), 'list-packages-'));
const write = (dir: string, manifest: object) => {
  mkdirSync(join(root, dir), { recursive: true });
  writeFileSync(join(root, dir, 'package.json'), JSON.stringify(manifest));
};
write('.', { repoConfig: { packages: { marker: 'rxova.slug' } } });
write('packages/b', { name: 'b', rxova: { slug: 'b' } });
write('packages/a', { name: 'a' });

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('listPackagesCommand', () => {
  const out = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    out.mockClear();
    error.mockClear();
  });

  it('prints the configured marker packages in both shapes', () => {
    expect(listPackagesCommand([], { root })).toBe(0);
    expect(out).toHaveBeenCalledWith('dirs=["b"]\ndirs_list=b\n');
  });

  it('takes the marker from the flag, in either spelling', () => {
    expect(listPackagesCommand(['--marker', 'name'], { root })).toBe(0);
    expect(out).toHaveBeenLastCalledWith('dirs=["a","b"]\ndirs_list=a b\n');
    expect(listPackagesCommand(['--marker=rxova'], { root })).toBe(0);
    expect(out).toHaveBeenLastCalledWith('dirs=["b"]\ndirs_list=b\n');
  });

  it('appends to GITHUB_OUTPUT when asked, and needs it set', () => {
    const output = join(root, 'output');
    expect(listPackagesCommand(['--github-output'], { root, env: { GITHUB_OUTPUT: output } })).toBe(
      0,
    );
    expect(readFileSync(output, 'utf8')).toBe('dirs=["b"]\ndirs_list=b\n');
    expect(listPackagesCommand(['--github-output'], { root, env: {} })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('needs GITHUB_OUTPUT'));
  });

  it('refuses a marker flag without a key', () => {
    expect(listPackagesCommand(['--marker'], { root })).toBe(1);
    expect(listPackagesCommand(['--marker='], { root })).toBe(1);
  });

  it('lists the published packages of the working directory by default', () => {
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(join(root, 'packages'));
    expect(listPackagesCommand()).toBe(0);
    expect(out).toHaveBeenLastCalledWith('dirs=[]\ndirs_list=\n');
    cwd.mockRestore();
  });
});
