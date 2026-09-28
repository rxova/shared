import { describe, expect, it } from "vitest";
import { dualBuildConfig } from "@/tsdown/dual-build-config";
import { reactBuildConfig } from "@/tsdown/react-build-config";

describe("reactBuildConfig", () => {
  it("is the dual build with React external and only ts-utils bundled", () => {
    expect(reactBuildConfig()).toEqual({
      ...dualBuildConfig(),
      deps: {
        neverBundle: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
        onlyBundle: ["@rxova/ts-utils"],
      },
    });
  });

  it("merges deps key by key and replaces the other fields", () => {
    const config = reactBuildConfig({
      deps: { onlyBundle: ["@rxova/ts-utils", "tiny-invariant"] },
      banner: { js: "'use client';" },
    });
    expect(config.deps).toEqual({
      neverBundle: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
      onlyBundle: ["@rxova/ts-utils", "tiny-invariant"],
    });
    expect(config.banner).toEqual({ js: "'use client';" });
  });
});
