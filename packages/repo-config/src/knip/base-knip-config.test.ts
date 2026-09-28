import { describe, expect, it } from "vitest";
import { baseKnipConfig } from "@/knip/base-knip-config";

describe("baseKnipConfig", () => {
  it("treats hints as errors and knows the docs app reaches @rxova/brand without an import", () => {
    expect(baseKnipConfig()).toEqual({
      treatConfigHintsAsErrors: true,
      workspaces: { "apps/docs": { ignoreDependencies: ["@rxova/brand"] } },
    });
  });

  it("drops the docs default without a docs app, or moves it", () => {
    expect(baseKnipConfig({ docsApp: false })).toEqual({ treatConfigHintsAsErrors: true });
    expect(baseKnipConfig({ docsApp: "site" }).workspaces).toEqual({
      site: { ignoreDependencies: ["@rxova/brand"] },
    });
  });

  it("passes the root lists through", () => {
    expect(
      baseKnipConfig({
        docsApp: false,
        ignoreDependencies: ["publint"],
        ignoreBinaries: ["overlock"],
        ignore: ["prototypes/**"],
      }),
    ).toEqual({
      treatConfigHintsAsErrors: true,
      ignoreDependencies: ["publint"],
      ignoreBinaries: ["overlock"],
      ignore: ["prototypes/**"],
    });
  });

  it("merges workspaces into the defaults and adds new ones", () => {
    const { workspaces } = baseKnipConfig({
      workspaces: {
        "apps/docs": {
          entry: ["playground/tab.tsx"],
          ignoreDependencies: ["@rxova/journey-react"],
          ignore: ["scripts/migrate-content.mjs"],
        },
        "apps/demo": { entry: ["src/*-main.tsx"] },
      },
    });
    expect(workspaces).toEqual({
      "apps/docs": {
        entry: ["playground/tab.tsx"],
        ignoreDependencies: ["@rxova/brand", "@rxova/journey-react"],
        ignore: ["scripts/migrate-content.mjs"],
      },
      "apps/demo": { entry: ["src/*-main.tsx"] },
    });
  });
});
