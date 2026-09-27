import { checkLlmsPackage } from '@rxova-helpers/llms/check-llms-package';
import { checkRootIndex } from '@rxova-helpers/llms/check-root-index';
import type { Failure } from '@rxova-helpers/llms/llms.types';
import { publishedPackages } from '@rxova-helpers/llms/published-packages';

/** Every `llms.txt` problem in the repository at `root`: each published package, then the index. */
export const collectLlmsFailures = (root: string): Failure[] => {
  const packages = publishedPackages(root);
  return [
    ...packages.flatMap((pkg) => checkLlmsPackage(root, pkg)),
    ...checkRootIndex(root, packages),
  ];
};
