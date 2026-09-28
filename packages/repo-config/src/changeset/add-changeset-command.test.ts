import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { addChangesetCommand } from '@/changeset/add-changeset-command';

const root = mkdtempSync(join(tmpdir(), 'add-changeset-'));
mkdirSync(join(root, 'packages', 'core'), { recursive: true });
writeFileSync(
  join(root, 'packages', 'core', 'package.json'),
  JSON.stringify({ name: '@rxova/journey-core' }),
);
writeFileSync(
  join(root, 'package.json'),
  JSON.stringify({ repoConfig: { changeset: { aliasPrefix: 'journey-' } } }),
);

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('addChangesetCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  it('writes a one-package changeset for an alias, creating .changeset/', () => {
    expect(addChangesetCommand(['core', 'minor', 'Add', 'it.'], { root, now: () => 35 })).toBe(0);
    const file = join(root, '.changeset', 'rxova-journey-core-z.md');
    expect(readFileSync(file, 'utf8')).toBe('---\n"@rxova/journey-core": minor\n---\n\nAdd it.\n');
    expect(log).toHaveBeenCalledWith(
      `add-changeset: wrote ${join('.changeset', 'rxova-journey-core-z.md')} (@rxova/journey-core: minor)`,
    );
    expect(readdirSync(join(root, '.changeset'))).toHaveLength(1);
  });

  it('lists the packages under --help', () => {
    expect(addChangesetCommand(['--help'], { root })).toBe(0);
    expect(addChangesetCommand(['-h'], { root })).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('  @rxova/journey-core'));
  });

  it('reports a bad argument without writing', () => {
    const write = vi.fn();
    expect(addChangesetCommand(['vue', 'patch', 'x'], { root, write })).toBe(1);
    expect(write).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('unknown package "vue"'));
  });

  it('reads the working directory by default', () => {
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue('/no/such/repo');
    expect(addChangesetCommand(['x', 'patch', 'y'])).toBe(1);
    cwd.mockRestore();
  });
});
