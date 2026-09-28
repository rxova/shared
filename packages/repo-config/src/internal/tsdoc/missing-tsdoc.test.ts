import { afterAll, describe, expect, it } from "vitest";
import { missingTsdoc } from "@/internal/tsdoc/missing-tsdoc";
import { cleanupTsdocRepos, tsdocRepo } from "@/internal/tsdoc/tsdoc-repo.fixtures";

afterAll(cleanupTsdocRepos);

const LIB = [
  "/** Adds. */",
  "export const add = (a: number, b: number) => a + b;",
  "export const sub = (a: number, b: number) => a - b;",
  "export function mul(a: number, b: number) { return a * b; }",
  "/** Divides. */",
  "export function div(a: number, b: number) { return a / b; }",
  "export const PI = 3.14;",
  "export interface Shape { area(): number }",
  "export type Unary = (a: number) => number;",
  "export class Box {}",
  "export default function main() {}",
].join("\n");

describe("missingTsdoc", () => {
  it("reports the callable exports with no summary, through re-exports, sorted", () => {
    const root = tsdocRepo({
      "packages/a/src/lib.ts": LIB,
      "packages/a/src/index.ts": "export * from './lib';\nexport { default } from './lib';\n",
      // No lib: the program then builds in milliseconds, and callability needs none.
      "packages/a/tsconfig.json": {
        compilerOptions: {
          strict: true,
          module: "esnext",
          moduleResolution: "bundler",
          noLib: true,
          types: [],
        },
      },
    });
    const source = {
      name: "a",
      entry: "packages/a/src/index.ts",
      tsconfig: "packages/a/tsconfig.json",
    };
    expect(missingTsdoc(source, root)).toEqual([
      { name: "mul", where: "packages/a/src/lib.ts:4" },
      { name: "sub", where: "packages/a/src/lib.ts:3" },
    ]);
    expect(missingTsdoc(source, root, ["sub"])).toEqual([
      { name: "mul", where: "packages/a/src/lib.ts:4" },
    ]);
  });

  // The default options load the full standard library, which takes seconds on a busy runner.
  it("builds with default options when the package has no tsconfig", { timeout: 60_000 }, () => {
    const root = tsdocRepo({ "src/index.ts": "export const f = () => 1;\n" });
    expect(missingTsdoc({ name: "x", entry: "src/index.ts", tsconfig: undefined }, root)).toEqual([
      { name: "f", where: "src/index.ts:1" },
    ]);
  });

  it("reports a broken tsconfig and an entry that is not a module", { timeout: 60_000 }, () => {
    const root = tsdocRepo({
      "index.ts": "const x = 1;\n",
      "tsconfig.json": { compilerOptions: { target: "nope" } },
    });
    expect(() =>
      missingTsdoc({ name: "x", entry: "index.ts", tsconfig: "tsconfig.json" }, root),
    ).toThrow(/^tsconfig\.json: /);
    expect(() =>
      missingTsdoc({ name: "x", entry: "index.ts", tsconfig: "missing/tsconfig.json" }, root),
    ).toThrow(/^missing\/tsconfig\.json: /);
    expect(() => missingTsdoc({ name: "x", entry: "gone.ts", tsconfig: undefined }, root)).toThrow(
      "gone.ts is not a module",
    );
    expect(() => missingTsdoc({ name: "x", entry: "index.ts", tsconfig: undefined }, root)).toThrow(
      "index.ts is not a module",
    );
  });
});
