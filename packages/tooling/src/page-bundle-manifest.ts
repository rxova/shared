import type { PageBundleManifest } from './page-bundle.types.js';

/**
 * The marker the rxova.org aggregator reads from a docs dist: which project the
 * artifact belongs to and what base path it was built for. A dist built at the
 * wrong base is the one failure the receiver cannot detect by looking at the
 * HTML, so the receiver's rules are checked here and a bad value fails the
 * build that wrote it rather than the deploy that reads it.
 */
export const pageBundleManifest = (project: string, base: string): PageBundleManifest => {
  const validProject = /^[a-z0-9][a-z0-9-]*$/;
  const validBase = /^\/(?:[a-z0-9][a-z0-9-]*\/)+$/;
  if (!validProject.test(project)) {
    throw new Error(
      `project "${project}" must be lowercase letters, digits and dashes, not starting with a dash`,
    );
  }
  if (!validBase.test(base)) {
    throw new Error(`base "${base}" must be a mount path like /packages/name/`);
  }
  return { schema: 2, format: 'html-page-component', project, base };
};
