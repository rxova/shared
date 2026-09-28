import type { Git } from "@/scope/scope.types";

/** A fake repository: `names` lists files, `patch` returns a diff per file, `deleted` the removed ones. */
export const fakeGit = (
  files: string[],
  patches: Record<string, string> = {},
  deleted: string[] = [],
): Git => ({
  names: () => files,
  patch: (_base, _head, file) => patches[file] ?? "",
  deleted: () => deleted,
});

/** A patch that moves only the version line of a manifest. */
export const BUMP = [
  "--- a/packages/example/package.json",
  "+++ b/packages/example/package.json",
  "@@ -3 +3 @@",
  '-  "version": "0.1.0",',
  '+  "version": "0.2.0",',
].join("\n");
