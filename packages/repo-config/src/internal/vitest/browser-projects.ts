import { configDefaults, type ViteUserConfig } from "vitest/config";
import type { BrowserProjectOptions } from "@/vitest/vitest.types";

type Projects = NonNullable<NonNullable<ViteUserConfig["test"]>["projects"]>;

/**
 * A unit project and a browser project over one config. Both inherit the root
 * (plugins, aliases, coverage) through `extends: true`; discovery lives only in
 * the projects, since an inherited `include` would be concatenated with the
 * project's own. The unit project leaves the browser files out, so
 * `vitest --project unit` never needs a browser.
 */
export const browserProjects = ({
  browser,
  unitName,
  environment,
  include,
  testExclude,
}: {
  readonly browser: BrowserProjectOptions;
  readonly unitName: string;
  readonly environment: string;
  readonly include: readonly string[];
  readonly testExclude: readonly string[];
}): Projects => [
  {
    extends: true,
    test: {
      name: unitName,
      environment,
      include: [...include],
      exclude: [...configDefaults.exclude, ...testExclude, ...browser.include],
    },
  },
  {
    extends: true,
    test: {
      name: browser.name ?? "browser",
      include: [...browser.include],
      exclude: [...configDefaults.exclude, ...testExclude],
      browser: {
        enabled: true,
        provider: browser.provider,
        headless: browser.headless ?? true,
        instances: [...browser.instances],
      },
    },
  },
];
