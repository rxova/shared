import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { declaredExports } from "@/internal/llms/declared-exports";
import { cleanupLlmsRepos, llmsRepo } from "@/internal/llms/llms-repo.fixtures";

afterEach(cleanupLlmsRepos);

const entry = (source: string) => {
  const root = llmsRepo({ lib: { name: "lib", index: source } });
  return declaredExports(join(root, "packages", "lib", "src", "index.ts"));
};

describe("declaredExports", () => {
  it.each([
    ["a re-export", "export { a } from './a'"],
    ["a type-only re-export", "export type { a } from './a'"],
    ["a local re-export", "const a = 1\nexport { a }"],
    ["a function", "export function a() {}"],
    ["a class", "export class a {}"],
    ["an interface", "export interface a {}"],
    ["a type alias", "export type a = string"],
    ["an enum", "export enum a {}"],
    ["a const", "export const a = 1"],
  ])("collects %s", (_, source) => {
    expect(entry(source)).toEqual(new Set(["a"]));
  });

  it("skips declarations that are not exported, and export * it cannot follow", () => {
    expect(
      entry("const a = 1\nfunction b() {}\nexport * from './c'\nexport const { d } = {}"),
    ).toEqual(new Set());
  });
});
