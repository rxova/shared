import { join } from 'node:path';
import type { Copy } from '@/install/install.types';
import { contentFiles } from '@/internal/install/content-files';
import { RUNNER } from '@/internal/install/install-paths';

/** Every file an install writes: `content/` to the same path in the target, and the runner. */
export const installCopies = (packageDir: string): Copy[] => {
  const content = join(packageDir, 'content');
  return [
    ...contentFiles(content).map((file) => ({ from: join(content, ...file.split('/')), to: file })),
    { from: join(packageDir, 'dist', 'hooks.js'), to: RUNNER },
  ];
};
