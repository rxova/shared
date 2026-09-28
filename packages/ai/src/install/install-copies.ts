import { join } from 'node:path';
import type { Copy } from '@/install/install.types';
import { contentFiles } from '@/internal/install/content-files';
import { RUNNER } from '@/internal/install/install-paths';

/**
 * The files an install writes for the chosen items: each chosen agent's file and each chosen
 * skill's folder from `content/` to the same path in the target, and always the hook runner.
 */
export const installCopies = (packageDir: string, items: readonly string[]): Copy[] => {
  const content = join(packageDir, 'content');
  const chosen = new Set(items);
  const wanted = (file: string) => {
    const [kind, name = ''] = file.split('/');
    return chosen.has(kind === 'agents' ? name.replace(/\.md$/, '') : name);
  };
  return [
    ...contentFiles(content)
      .filter(wanted)
      .map((file) => ({ from: join(content, ...file.split('/')), to: file })),
    { from: join(packageDir, 'dist', 'hooks.js'), to: RUNNER },
  ];
};
