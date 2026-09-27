// Test doubles several suites share, in this package and in the published ones.
// Reached as `@rxova/helpers/fixtures`; never part of a build.
export { BUMP, fakeGit } from './fake-git.fixtures.ts';
export { fakeWorkspaceFiles, manifestWithFloor } from './fake-workspace-files.fixtures.ts';
export { fakeNpm, memoryScratch, PARENT, SCRATCH } from './memory-scratch.fixtures.ts';
export {
  apiTable,
  cleanupLlmsRepos,
  INDEX,
  llmsRepo,
  PKG,
  wellFormed,
  type PackageSpec,
} from './llms-repo.fixtures.ts';
