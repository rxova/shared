import { join } from 'node:path';
import { checkLlmsPackage } from '@/internal/llms/check-llms-package';
import { checkRootIndex } from '@/internal/llms/check-root-index';
import type { Failure } from '@/internal/llms/llms.types';
import { publishedPackages } from '@/internal/llms/published-packages';
import { readConfig } from '@/config/read-config';
import { readPackageConfig } from '@/config/read-package-config';

/**
 * Every `llms.txt` problem in the repository at `root`: each published
 * package under the root `repoConfig.llms` merged with its own
 * `package.json#repoConfig.llms`, then the root index unless
 * `rootIndex` is false.
 */
export const collectLlmsFailures = (root: string): Failure[] => {
  const config = readConfig(root).llms ?? {};
  const packages = publishedPackages(root);
  return [
    ...packages.flatMap((pkg) =>
      checkLlmsPackage(root, pkg, {
        ...config,
        ...readPackageConfig(join(root, 'packages', pkg.dir)).llms,
      }),
    ),
    ...(config.rootIndex === false ? [] : checkRootIndex(root, packages)),
  ];
};
