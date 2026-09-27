import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { workspaceFiles } from '@/internal/node-floor/workspace-files';

const here = dirname(fileURLToPath(import.meta.url));

describe('workspaceFiles', () => {
  it('lists and reads real files', () => {
    expect(workspaceFiles.list(here)).toContain('workspace-files.ts');
    expect(workspaceFiles.read(join(here, '..', '..', '..', 'package.json'))).toContain(
      '"@rxova/tooling"',
    );
  });

  it('treats a missing directory or file as empty rather than throwing', () => {
    expect(workspaceFiles.list(join(here, 'no-such-dir'))).toEqual([]);
    expect(workspaceFiles.read(join(here, 'no-such-file.json'))).toBeUndefined();
  });
});
