/** `@changesets/changelog-github` with the "Thanks @user!" attribution removed. */
declare const changelog: {
  getReleaseLine: (...args: readonly unknown[]) => Promise<string>;
  getDependencyReleaseLine: (...args: readonly unknown[]) => Promise<string>;
};
export = changelog;
