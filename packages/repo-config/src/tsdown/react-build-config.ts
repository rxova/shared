import type { UserConfig } from "tsdown";
import { dualBuildConfig } from "@/tsdown/dual-build-config";

/**
 * {@link dualBuildConfig} for a React component or hook library: React is
 * never bundled, and `@rxova/ts-utils` is the one dependency that may be. That
 * whitelist is what keeps a package dependency-free while ts-utils sits in the
 * repository root's devDependencies: the helpers are inlined, and bundling
 * anything else fails the build instead of shipping it quietly.
 *
 * `deps` merges key by key with the defaults; every other override replaces.
 */
export const reactBuildConfig = ({ deps, ...overrides }: UserConfig = {}): UserConfig =>
  dualBuildConfig({
    deps: {
      neverBundle: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
      onlyBundle: ["@rxova/ts-utils"],
      ...deps,
    },
    ...overrides,
  });
