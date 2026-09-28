import { checkLlmsPackage } from '@/internal/llms/check-llms-package';
import { checkRootIndex } from '@/internal/llms/check-root-index';
import type { Failure } from '@/internal/llms/llms.types';
import { publishedPackages } from '@/internal/llms/published-packages';

/** Every `llms.txt` problem in the repository at `root`: each published package, then the index. */
export const collectLlmsFailures = (root: string): Failure[] => {
  const packages = publishedPackages(root);
  return [
    ...packages.flatMap((pkg) => checkLlmsPackage(root, pkg)),
    ...checkRootIndex(root, packages),
  ];
};
