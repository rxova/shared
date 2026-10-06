/**
 * What `fix-lockfile` runs, in order: re-resolve the lockfile against the
 * manifests without touching `node_modules`, then collapse the duplicates the
 * bump left behind. Neither runs a dependency's install scripts, because the
 * job that calls it holds a token that can push.
 */
export const LOCKFILE_REPAIRS: readonly string[] = [
  "pnpm install --lockfile-only --no-frozen-lockfile --ignore-scripts",
  "pnpm dedupe --ignore-scripts",
];
