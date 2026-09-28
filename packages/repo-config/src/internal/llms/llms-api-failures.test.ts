import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { llmsApiFailures } from "@/internal/llms/llms-api-failures";
import { apiTable } from "@/internal/llms/llms-repo.fixtures";

const made: string[] = [];
const pkg = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), "llms-api-"));
  made.push(dir);
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), contents);
  }
  return dir;
};

afterAll(() => {
  for (const dir of made) rmSync(dir, { recursive: true, force: true });
});

const index = "export { a } from './a';\nexport const b = 1;\n";

describe("llmsApiFailures", () => {
  it("exact: both directions against src/index.ts", () => {
    const dir = pkg({ "src/index.ts": index });
    expect(llmsApiFailures(dir, apiTable("a", "b"))).toEqual([]);
    expect(llmsApiFailures(dir, apiTable("a", "gone"))).toEqual([
      "llms.txt documents `gone`, which src/index.ts does not export",
      "llms.txt does not document `b`, which src/index.ts exports",
    ]);
  });

  it("exact with subpaths reads every entry point", () => {
    const dir = pkg({
      "src/index.ts": index,
      "src/devtools/index.ts": "export const Inspector = 1;\n",
    });
    expect(llmsApiFailures(dir, apiTable("a", "b", "Inspector"), { entries: "subpaths" })).toEqual(
      [],
    );
    expect(llmsApiFailures(dir, apiTable("a", "x"), { entries: "subpaths" })).toEqual([
      "llms.txt documents `x`, which no entry point exports",
      "llms.txt does not document `b`, which an entry point exports",
      "llms.txt does not document `Inspector`, which an entry point exports",
    ]);
  });

  it("documented: only the documented names must exist; no table is fine", () => {
    const dir = pkg({ "src/index.ts": index });
    expect(llmsApiFailures(dir, apiTable("a"), { api: "documented" })).toEqual([]);
    expect(llmsApiFailures(dir, "# x", { api: "documented" })).toEqual([]);
    expect(llmsApiFailures(dir, apiTable("gone"), { api: "documented" })).toEqual([
      "llms.txt documents `gone`, which src/index.ts does not export",
    ]);
  });

  it("fails when there is no entry to check against", () => {
    expect(llmsApiFailures(pkg({}), apiTable("a"))).toEqual([
      "has no src/index.ts to check the llms.txt API table against",
    ]);
  });

  it("props: the ## Props table against src/types.ts", () => {
    const props = "## Props\n\n| `value` | x |\n| `gone` | x |\n";
    const dir = pkg({ "src/types.ts": "export interface P { value: string }\n" });
    expect(llmsApiFailures(dir, props, { api: "props" })).toEqual([
      "llms.txt documents `gone`, which no longer exists in src/types.ts",
    ]);
    expect(llmsApiFailures(dir, "# no table", { api: "props" })).toEqual([]);
    expect(llmsApiFailures(pkg({}), props, { api: "props" })).toEqual([
      "llms.txt documents props, but src/types.ts declares none to check against",
    ]);
  });

  it("none: checks nothing", () => {
    expect(llmsApiFailures(pkg({}), apiTable("a"), { api: "none" })).toEqual([]);
  });
});
