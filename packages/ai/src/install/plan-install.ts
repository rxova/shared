import type { InstallPlan, Manifest } from '@/install/install.types';
import { installCopies } from '@/install/install-copies';

/**
 * What an install copies, and which destinations belong to someone else: a file that exists
 * but is not in the previous manifest is listed as a conflict rather than overwritten.
 */
export const planInstall = ({
  packageDir,
  previous,
  exists,
}: {
  packageDir: string;
  previous: Manifest | undefined;
  exists: (relative: string) => boolean;
}): InstallPlan => {
  const copies = installCopies(packageDir);
  const owned = new Set(previous?.files ?? []);
  return {
    copies,
    conflicts: copies.map(({ to }) => to).filter((to) => !owned.has(to) && exists(to)),
  };
};
