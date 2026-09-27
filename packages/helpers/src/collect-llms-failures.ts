import { checkLlmsPackage } from './check-llms-package.ts';
import { checkRootIndex } from './check-root-index.ts';
import type { Failure } from './llms.types.ts';
import { publishedPackages } from './published-packages.ts';

/** Every `llms.txt` problem in the repository at `root`: each published package, then the index. */
export const collectLlmsFailures = (root: string): Failure[] => {
  const packages = publishedPackages(root);
  return [
    ...packages.flatMap((pkg) => checkLlmsPackage(root, pkg)),
    ...checkRootIndex(root, packages),
  ];
};
