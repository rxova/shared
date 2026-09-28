import ts from "typescript";
import { describe, expect, it } from "vitest";
import { needsSummary } from "@/internal/tsdoc/needs-summary";

const exportsOf = (code: string) => {
  const host = ts.createCompilerHost({});
  const readFile = host.readFile.bind(host);
  host.readFile = (file) => (file === "entry.ts" ? code : readFile(file));
  host.fileExists = (file) => file === "entry.ts" || ts.sys.fileExists(file);
  const program = ts.createProgram({ rootNames: ["entry.ts"], options: { noLib: true }, host });
  const checker = program.getTypeChecker();
  const file = program.getSourceFile("entry.ts");
  const module = file && checker.getSymbolAtLocation(file);
  if (module === undefined) throw new Error("no module");
  return Object.fromEntries(
    checker
      .getExportsOfModule(module)
      .map((symbol) => [
        symbol.name,
        needsSummary(symbol, symbol.getDeclarations() ?? [], checker),
      ]),
  );
};

describe("needsSummary", () => {
  it("asks for callables only", () => {
    expect(
      exportsOf(
        [
          "export function f() {}",
          "export const g = () => 1;",
          "export const n = 1;",
          "export interface I { m(): void }",
          "export type T = () => void;",
          "export class C { m() {} }",
        ].join("\n"),
      ),
    ).toEqual({ f: true, g: true, n: false, I: false, T: false, C: false });
  });

  it("asks for a method declared on its own", () => {
    const source = ts.createSourceFile("x.ts", "class C { m() {} }", ts.ScriptTarget.Latest);
    const cls = source.statements[0] as ts.ClassDeclaration;
    const method = cls.members[0] as ts.MethodDeclaration;
    expect(needsSummary({} as ts.Symbol, [method], {} as ts.TypeChecker)).toBe(true);
  });
});
