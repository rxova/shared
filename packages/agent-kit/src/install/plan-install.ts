import type { InstallPlan, InstallTarget, Manifest } from "@/install/install.types";
import { installCopies } from "@/install/install-copies";

/**
 * What an install writes into one target, and which destinations belong to someone else: a file
 * that exists but is not in the previous manifest is listed as a conflict rather than overwritten.
 */
export const planInstall = ({
  packageDir,
  items,
  previous,
  exists,
  target,
  withSkills = true,
}: {
  packageDir: string;
  items: readonly string[];
  previous: Manifest | undefined;
  exists: (relative: string) => boolean;
  target?: InstallTarget;
  withSkills?: boolean;
}): InstallPlan => {
  const copies = installCopies(packageDir, items, target, { withSkills });
  const owned = new Set(previous?.files ?? []);
  return {
    copies,
    conflicts: copies.map(({ to }) => to).filter((to) => !owned.has(to) && exists(to)),
  };
};
