import { RELEASE_BRANCH } from '@/internal/verify/release-branch';

/**
 * Whether this run checks the release pull request: GitHub sets
 * `GITHUB_HEAD_REF` to the source branch of the pull request being built.
 */
export const isReleaseBranch = (env: NodeJS.ProcessEnv): boolean =>
  env.GITHUB_HEAD_REF === RELEASE_BRANCH;
