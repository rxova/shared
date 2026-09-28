import { describe, expect, it } from "vitest";
import { parseConfig } from "@/config/parse-config";

describe("parseConfig", () => {
  it("is empty when the field is absent", () => {
    expect(parseConfig(undefined)).toEqual({});
  });

  it("reads verify steps and the changeset rule", () => {
    expect(
      parseConfig({
        verify: { steps: [{ name: "lint", command: "pnpm lint" }] },
        changeset: { singlePackage: true },
      }),
    ).toEqual({
      verify: { steps: [{ name: "lint", command: "pnpm lint" }] },
      changeset: { singlePackage: true },
    });
  });

  it("keeps empty sections empty", () => {
    expect(parseConfig({ verify: {}, changeset: {} })).toEqual({ verify: {}, changeset: {} });
  });

  it("reads every section, as written", () => {
    const config = {
      verify: { steps: [{ name: "audit", command: "pnpm audit", skipOnRelease: true }] },
      changeset: {
        singlePackage: true,
        scope: "shipped",
        roots: ["packages"],
        aliasPrefix: "journey-",
        includePrivate: true,
        syncRootVersionFrom: "@rxova/journey-core",
      },
      majors: { packages: ["a", "b"] },
      tsdoc: { entries: { a: "packages/a/src/main.ts" }, exclude: ["internal"] },
      docs: {
        root: "docs",
        banned: [{ name: "old", pattern: "\\bold\\b" }],
        allow: ["**/releases.md"],
        exclude: ["**/api/**"],
        readmes: false,
      },
      snippets: { include: ["README.md"], skipInfo: ["live", "skip"] },
      packages: { marker: "rxova.slug" },
      postPublish: { importPattern: "^@rxova/react-", peers: { react: "^19" } },
      llms: { api: "props", rootIndex: true },
      scope: { ignore: ["docs/**"], keep: ["docs/fixtures/**"], site: ["site/**"] },
      testScripts: { globs: ["packages/*"] },
      fileSize: { max: 400, extensions: ["ts"], ignore: ["pnpm-lock.yaml"], allow: ["big.ts"] },
    };
    expect(parseConfig(config)).toEqual(config);
  });

  it("keeps every section empty when it is written empty", () => {
    const empty = {
      majors: {},
      tsdoc: {},
      docs: {},
      snippets: {},
      packages: {},
      postPublish: {},
      llms: {},
      scope: {},
      testScripts: {},
      fileSize: {},
    };
    expect(parseConfig(empty)).toEqual(empty);
  });

  it.each([
    [[], "package.json#repoConfig must be an object"],
    [{ verfy: {} }, 'unknown key "verfy"'],
    [{ verify: [] }, "package.json#repoConfig.verify must be an object"],
    [{ verify: { step: [] } }, 'unknown key "step"'],
    [{ verify: { steps: {} } }, "repoConfig.verify.steps must be an array"],
    [{ verify: { steps: [{ name: "x" }] } }, "repoConfig.verify.steps[0] must be"],
    [{ changeset: true }, "repoConfig.changeset must be an object"],
    [{ changeset: { single: true } }, 'unknown key "single"'],
    [{ changeset: { singlePackage: "yes" } }, "singlePackage must be a boolean"],
    [
      { changeset: { scope: "all" } },
      'repoConfig.changeset.scope must be one of "code", "shipped"',
    ],
    [{ majors: { packages: "a" } }, "repoConfig.majors.packages must be an array"],
    [{ tsdoc: { entries: ["a"] } }, "repoConfig.tsdoc.entries must be an object"],
    [{ docs: { banned: {} } }, "repoConfig.docs.banned must be an array"],
    [{ docs: { banned: [{ name: "x", pattern: "(" }] } }, "repoConfig.docs.banned[0].pattern"],
    [{ snippets: { include: [1] } }, "repoConfig.snippets.include must be an array"],
    [{ packages: { marker: "" } }, "repoConfig.packages.marker must be a non-empty string"],
    [{ postPublish: { importPattern: "[" } }, "repoConfig.postPublish.importPattern"],
    [{ llms: { api: "x" } }, "repoConfig.llms.api must be one of"],
    [{ scope: { ignore: "**/*.md" } }, "repoConfig.scope.ignore must be an array"],
    [{ scope: { skip: [] } }, 'unknown key "skip"'],
    [{ fileSize: { max: 0 } }, "repoConfig.fileSize.max must be a positive integer"],
  ])("rejects %j", (raw, message) => {
    expect(() => parseConfig(raw)).toThrow(message);
  });
});
