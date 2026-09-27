import { isTestFile } from '@rxova/helpers';

/**
 * Whether the diff touches something a published package ships. Markdown and
 * tests inside a package are excluded: neither reaches the tarball, so neither
 * needs a changelog entry. `published` holds directory names under `packages/`.
 */
export const touchesPackage = (changed: string[], published: string[]): boolean =>
  changed.some(
    (file) =>
      published.some((dir) => file.startsWith(`packages/${dir}/`)) &&
      !file.endsWith('.md') &&
      !isTestFile(file),
  );
