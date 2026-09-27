import type { CommandEntry } from '@/cli/cli.types';

/**
 * Every `rxova-tooling` command, by name. Each is loaded on demand, so
 * `check-llms` alone pays for the TypeScript compiler.
 */
export const commands = (): Record<string, CommandEntry> => ({
  verify: {
    summary: 'run the pre-push gate (package.json#tooling.verify.steps; --only a,b)',
    load: async () => {
      const { verifyCommand } = await import('@/verify/verify-command');
      return (argv) => verifyCommand(argv);
    },
  },
  'check-changeset': {
    summary: 'require a changeset when a published package changed (BASE_SHA, HEAD_SHA)',
    load: async () => {
      const { checkChangesetCommand } = await import('@/changeset/check-changeset-command');
      return () => checkChangesetCommand();
    },
  },
  'check-scope': {
    summary: 'report code-changed=false for a release commit (BASE_SHA, HEAD_SHA)',
    load: async () => {
      const { checkScopeCommand } = await import('@/scope/check-scope-command');
      return () => checkScopeCommand();
    },
  },
  'node-floor': {
    summary: 'read the oldest Node the published packages support, for CI',
    load: async () => {
      const { nodeFloorCommand } = await import('@/node-floor/node-floor-command');
      return () => nodeFloorCommand();
    },
  },
  'pack-smoke': {
    summary: 'pack, install, import and require a package from its tarball [dir]',
    load: async () => {
      const { packSmokeCommand } = await import('@/pack-smoke/pack-smoke-command');
      return (argv) => packSmokeCommand(argv[0]);
    },
  },
  'check-llms': {
    summary: "check each published llms.txt against the package's exports [root]",
    load: async () => {
      const { checkLlmsCommand } = await import('@/llms/check-llms-command');
      return (argv) => checkLlmsCommand(argv[0]);
    },
  },
});
