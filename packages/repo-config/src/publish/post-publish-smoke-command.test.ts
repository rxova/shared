import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { memoryScratch, SCRATCH } from '@/internal/pack-smoke/memory-scratch.fixtures';
import { postPublishSmokeCommand } from '@/publish/post-publish-smoke-command';

describe('postPublishSmokeCommand', () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  const PUBLISHED = JSON.stringify([
    { name: '@rxova/react-otp-input', version: '1.2.0' },
    { name: '@rxova/codemod', version: '1.0.1' },
  ]);

  const run = (
    root: string | undefined,
    sh: (command: string, args: string[]) => string,
    env: NodeJS.ProcessEnv = { PUBLISHED_PACKAGES: PUBLISHED },
  ) => {
    const scratch = memoryScratch({});
    const code = postPublishSmokeCommand({
      env,
      root: root ?? '/no/such/repo',
      sh: (command, args) => sh(command, args),
      fs: scratch.fs,
      sleep: () => {},
      now: () => 0,
    });
    return { code, ...scratch };
  };

  const healthy = (command: string, args: string[]) => {
    if (command === 'npm' && args[0] === 'view') return `${String(args[1]?.split('@').pop())}\n`;
    if (command === 'node') return '  ok\n';
    return '';
  };

  it('installs exactly the published versions and verifies them, removing the scratch', () => {
    const { code, files, removed } = run(undefined, healthy);
    expect(code).toBe(0);
    expect(JSON.parse(files.get(join(SCRATCH, 'package.json')) ?? '')).toMatchObject({
      dependencies: { '@rxova/react-otp-input': '1.2.0', '@rxova/codemod': '1.0.1' },
    });
    expect(files.get(join(SCRATCH, 'verify.mjs'))).toContain('@rxova/codemod');
    expect(removed).toEqual([SCRATCH]);
    expect(log).toHaveBeenCalledWith('post-publish-smoke: ok');
  });

  it('waits for a version the registry does not serve yet', () => {
    let views = 0;
    const sh = (command: string, args: string[]) => {
      if (command === 'npm' && args[0] === 'view') {
        views += 1;
        if (views === 1) throw new Error('E404');
        return views === 2 ? 'old\n' : `${String(args[1]?.split('@').pop())}\n`;
      }
      return healthy(command, args);
    };
    expect(run(undefined, sh).code).toBe(0);
    expect(views).toBeGreaterThan(2);
  });

  it('adds the configured peers and imports only the packages the pattern matches', () => {
    const root = mkdtempSync(join(tmpdir(), 'post-publish-'));
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({
        repoConfig: { postPublish: { importPattern: '^@rxova/react-', peers: { react: '^19' } } },
      }),
    );
    try {
      const { code, files } = run(root, healthy);
      expect(code).toBe(0);
      expect(JSON.parse(files.get(join(SCRATCH, 'package.json')) ?? '')).toMatchObject({
        dependencies: { react: '^19', '@rxova/codemod': '1.0.1' },
      });
      const verifier = files.get(join(SCRATCH, 'verify.mjs')) ?? '';
      const importable = verifier.slice(verifier.lastIndexOf('for (const item of'));
      expect(importable).toContain('@rxova/react-otp-input');
      expect(importable).not.toContain('@rxova/codemod');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('fails without PUBLISHED_PACKAGES', () => {
    expect(run(undefined, healthy, {}).code).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('lists no published package'));
  });

  it('fails when the verifier fails, and still removes the scratch', () => {
    const sh = (command: string, args: string[]) => {
      if (command === 'node') throw new Error('exposes no exports');
      return healthy(command, args);
    };
    const { code, removed } = run(undefined, sh);
    expect(code).toBe(1);
    expect(removed).toEqual([SCRATCH]);
  });
});
