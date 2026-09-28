import {
  fakeWorkspaceFiles,
  manifestWithFloor as pkg,
} from '@/internal/node-floor/fake-workspace-files.fixtures';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { readPublished } from '@/node-floor/read-published';

describe('readPublished', () => {
  it('reads each published package and its floor', () => {
    const fs = fakeWorkspaceFiles({ lib: pkg('@scope/lib', '>=22.13') });
    expect(readPublished('/repo', fs)).toEqual([
      { dir: 'packages/lib', name: '@scope/lib', floor: '22.13' },
    ]);
  });

  it('skips private packages and directories without a manifest', () => {
    const fs = fakeWorkspaceFiles({
      tooling: pkg('@scope/tooling', undefined, { private: true }),
      stray: undefined,
    });
    expect(readPublished('/repo', fs)).toEqual([]);
  });

  it('refuses a published package without engines.node', () => {
    const fs = fakeWorkspaceFiles({ lib: pkg('@scope/lib') });
    expect(() => readPublished('/repo', fs)).toThrow('@scope/lib is published but declares no');
  });

  it('refuses a range with no single floor, naming the directory when the name is missing', () => {
    const fs = fakeWorkspaceFiles({ lib: { engines: { node: '^22.13' } } });
    expect(() => readPublished('/repo', fs)).toThrow('packages/lib: engines.node "^22.13"');
  });

  it('reads this repository from disk by default', () => {
    const root = fileURLToPath(new URL('../../../../', import.meta.url));
    expect(
      readPublished(root)
        .map(({ name }) => name)
        .sort(),
    ).toEqual(['@rxova/ai', '@rxova/repo-config', '@rxova/ts-utils']);
  });
});
