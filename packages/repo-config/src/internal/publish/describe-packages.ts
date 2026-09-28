import type { PublishedPackage } from "@/internal/publish/published-package.types";

/** `a@1.0.0, b@2.0.0`. */
export const describePackages = (packages: readonly PublishedPackage[]): string =>
  packages.map(({ name, version }) => `${name}@${version}`).join(", ");
