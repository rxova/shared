import type { WorkspaceFiles } from '../../tooling/src/node-floor.types.ts';

/** A fake workspace: package directory → manifest, or undefined for a directory without one. */
export const fakeWorkspaceFiles = (
  manifests: Record<string, object | undefined>,
): WorkspaceFiles => ({
  list: () => Object.keys(manifests),
  read: (file) => {
    const entry = file.split(/[\\/]/).at(-2) ?? '';
    const manifest = manifests[entry];
    return manifest === undefined ? undefined : JSON.stringify(manifest);
  },
});

/** A manifest with a name and, optionally, a Node floor. */
export const manifestWithFloor = (name: string, node?: string, extra: object = {}): object => ({
  name,
  ...(node === undefined ? {} : { engines: { node } }),
  ...extra,
});
