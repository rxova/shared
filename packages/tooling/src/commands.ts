import type { CommandEntry } from './cli.types.js';

/**
 * Every `rxova-tooling` command, by name. Each is loaded on demand, so
 * `check-llms` alone pays for the TypeScript compiler.
 */
export const commands = (): Record<string, CommandEntry> => ({
  verify: {
    summary: 'run the pre-push gate (package.json#tooling.verify.steps; --only a,b)',
    load: async () => {
      const { verifyCommand } = await import('./verify-command.js');
      return (argv) => verifyCommand(argv);
    },
  },
  'check-changeset': {
    summary: 'require a changeset when a published package changed (BASE_SHA, HEAD_SHA)',
    load: async () => {
      const { checkChangesetCommand } = await import('./check-changeset-command.js');
      return () => checkChangesetCommand();
    },
  },
  'check-scope': {
    summary: 'report code-changed=false for a release commit (BASE_SHA, HEAD_SHA)',
    load: async () => {
      const { checkScopeCommand } = await import('./check-scope-command.js');
      return () => checkScopeCommand();
    },
  },
  'node-floor': {
    summary: 'read the oldest Node the published packages support, for CI',
    load: async () => {
      const { nodeFloorCommand } = await import('./node-floor-command.js');
      return () => nodeFloorCommand();
    },
  },
  'pack-smoke': {
    summary: 'pack, install, import and require a package from its tarball [dir]',
    load: async () => {
      const { packSmokeCommand } = await import('./pack-smoke-command.js');
      return (argv) => packSmokeCommand(argv[0]);
    },
  },
  'check-llms': {
    summary: "check each published llms.txt against the package's exports [root]",
    load: async () => {
      const { checkLlmsCommand } = await import('./check-llms-command.js');
      return (argv) => checkLlmsCommand(argv[0]);
    },
  },
  'write-page-bundle': {
    summary: 'mark a docs dist for the rxova.org aggregator <dist> <project> <base>',
    load: async () => {
      const { writePageBundleCommand } = await import('./write-page-bundle-command.js');
      return (argv) => writePageBundleCommand(argv);
    },
  },
});
