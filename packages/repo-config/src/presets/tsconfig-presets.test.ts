import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";
import { afterAll, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const scratch = realpathSync(mkdtempSync(join(tmpdir(), "rxova-tsconfig-")));

afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
});

/** The options a project extending `preset` ends up with, as `tsc` resolves them. */
const optionsOf = (preset: string) => {
  const file = join(scratch, `${preset}.tsconfig.json`);
  // Extended by the path the exports map resolves to: the scratch project has no node_modules.
  const extended = require.resolve(`@rxova/repo-config/${preset}`);
  writeFileSync(file, JSON.stringify({ extends: extended, files: [] }));
  const { config } = ts.readConfigFile(file, (path) => ts.sys.readFile(path));
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, scratch, undefined, file);
  expect(parsed.errors).toEqual([]);
  return parsed.options;
};

const base = () => optionsOf("tsconfig.base.json");

describe("the tsconfig presets", () => {
  it("resolves every preset through the exports map", () => {
    for (const name of ["base", "dom", "react", "node"]) {
      expect(require.resolve(`@rxova/repo-config/tsconfig.${name}.json`)).toMatch(
        new RegExp(`presets/tsconfig\\.${name}\\.json$`),
      );
    }
  });

  it("keeps the base strict, DOM-free and bundler-resolved", () => {
    expect(base()).toMatchObject({
      target: ts.ScriptTarget.ES2023,
      lib: ["lib.es2023.d.ts"],
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      exactOptionalPropertyTypes: true,
      verbatimModuleSyntax: true,
      noEmit: true,
    });
  });

  it("adds the DOM libs in dom and nothing else", () => {
    const dom = optionsOf("tsconfig.dom.json");
    expect(dom.lib).toEqual(["lib.es2023.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"]);
    expect({ ...dom, lib: base().lib, configFilePath: undefined }).toEqual({
      ...base(),
      configFilePath: undefined,
    });
  });

  it("adds the automatic JSX runtime on top of dom in react", () => {
    const react = optionsOf("tsconfig.react.json");
    expect(react.jsx).toBe(ts.JsxEmit.ReactJSX);
    expect(react.lib).toEqual(optionsOf("tsconfig.dom.json").lib);
  });

  it("runs scripts under Node type stripping in node", () => {
    expect(optionsOf("tsconfig.node.json")).toMatchObject({
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      allowImportingTsExtensions: true,
      erasableSyntaxOnly: true,
      verbatimModuleSyntax: true,
      types: ["node"],
      strict: true,
      noEmit: true,
    });
  });
});
