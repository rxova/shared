import type { CommandEntry } from "@/cli/cli.types";

/**
 * Every `rxova-repo-config` command, by name. Each is loaded on demand, so
 * only the commands that read TypeScript pay for the compiler.
 */
export const commands = (): Record<string, CommandEntry> => ({
  verify: {
    summary: "run the pre-push gate (package.json#repoConfig.verify.steps; --only a,b)",
    load: async () => {
      const { verifyCommand } = await import("@/verify/verify-command");
      return (argv) => verifyCommand(argv);
    },
  },
  "pre-push": {
    summary: "the .husky/pre-push hook: skip a delete-only push, else verify [--only a,b]",
    load: async () => {
      const { prePushCommand } = await import("@/hooks/pre-push-command");
      return (argv) => prePushCommand(argv);
    },
  },
  "check-changeset": {
    summary: "require a changeset when a published package changed (BASE_SHA, HEAD_SHA)",
    load: async () => {
      const { checkChangesetCommand } = await import("@/changeset/check-changeset-command");
      return () => checkChangesetCommand();
    },
  },
  "lint-changesets": {
    summary: "fail changesets the changelog would misread (commit:, pr:, author: lines)",
    load: async () => {
      const { lintChangesetsCommand } = await import("@/changeset/lint-changesets-command");
      return () => lintChangesetsCommand();
    },
  },
  "add-changeset": {
    summary: "write a one-package changeset: <package> <patch|minor|major> <summary…>",
    load: async () => {
      const { addChangesetCommand } = await import("@/changeset/add-changeset-command");
      return (argv) => addChangesetCommand(argv);
    },
  },
  version: {
    summary: "changeset version, sync the root version, refresh the lockfile",
    load: async () => {
      const { versionCommand } = await import("@/changeset/version-command");
      return () => versionCommand();
    },
  },
  "check-scope": {
    summary: "report code-changed, docs-only and docs-changed for a range (BASE_SHA, HEAD_SHA)",
    load: async () => {
      const { checkScopeCommand } = await import("@/scope/check-scope-command");
      return () => checkScopeCommand();
    },
  },
  "check-majors": {
    summary: "require the published packages to share one major version",
    load: async () => {
      const { checkMajorsCommand } = await import("@/majors/check-majors-command");
      return () => checkMajorsCommand();
    },
  },
  "node-floor": {
    summary: "read the oldest Node the published packages support, for CI",
    load: async () => {
      const { nodeFloorCommand } = await import("@/node-floor/node-floor-command");
      return () => nodeFloorCommand();
    },
  },
  "pack-smoke": {
    summary: "pack, install, import and require a package from its tarball [dir]",
    load: async () => {
      const { packSmokeCommand } = await import("@/pack-smoke/pack-smoke-command");
      return (argv) => packSmokeCommand(argv[0]);
    },
  },
  "check-exports": {
    summary: "publint --strict and attw --pack on this package [--profile p]",
    load: async () => {
      const { checkExportsCommand } = await import("@/exports/check-exports-command");
      return (argv) => checkExportsCommand(argv);
    },
  },
  "post-publish-smoke": {
    summary: "install and load what npm now serves (PUBLISHED_PACKAGES)",
    load: async () => {
      const { postPublishSmokeCommand } = await import("@/publish/post-publish-smoke-command");
      return () => postPublishSmokeCommand();
    },
  },
  "check-llms": {
    summary: "check each published llms.txt against the package's source [root]",
    load: async () => {
      const { checkLlmsCommand } = await import("@/llms/check-llms-command");
      return (argv) => checkLlmsCommand(argv[0]);
    },
  },
  "check-tsdoc": {
    summary: "require a TSDoc summary on every callable public export",
    load: async () => {
      const { checkTsdocCommand } = await import("@/tsdoc/check-tsdoc-command");
      return () => checkTsdocCommand();
    },
  },
  "check-banned": {
    summary: "fail docs that name removed APIs (repoConfig.docs.banned)",
    load: async () => {
      const { checkBannedCommand } = await import("@/docs/check-banned-command");
      return () => checkBannedCommand();
    },
  },
  "check-snippets": {
    summary: "require every ts/tsx/js/jsx fence in the READMEs and llms.txt to parse",
    load: async () => {
      const { checkSnippetsCommand } = await import("@/docs/check-snippets-command");
      return () => checkSnippetsCommand();
    },
  },
  "check-test-scripts": {
    summary: "require a test script wherever a vitest config is",
    load: async () => {
      const { checkTestScriptsCommand } = await import("@/tests/check-test-scripts-command");
      return () => checkTestScriptsCommand();
    },
  },
  "check-file-size": {
    summary: "fail tracked files over repoConfig.fileSize.max lines",
    load: async () => {
      const { checkFileSizeCommand } = await import("@/size/check-file-size-command");
      return () => checkFileSizeCommand();
    },
  },
  "coverage-summary": {
    summary: "write the coverage totals to the job summary [coverage-summary.json]",
    load: async () => {
      const { coverageSummaryCommand } =
        await import("@/coverage-summary/coverage-summary-command");
      return (argv) => coverageSummaryCommand(argv[0]);
    },
  },
  "list-packages": {
    summary: "print the packages a CI matrix runs over [--marker key] [--github-output]",
    load: async () => {
      const { listPackagesCommand } = await import("@/packages/list-packages-command");
      return (argv) => listPackagesCommand(argv);
    },
  },
});
