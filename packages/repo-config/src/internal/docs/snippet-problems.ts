import ts from "typescript";
import type { Snippet } from "@/internal/docs/fenced-snippets";

/**
 * Why a copy-paste snippet would not work: it does not parse as a module of
 * its language, a JSX line starts with a stray `;` (a formatter artefact), or
 * it calls `useState` without importing it.
 */
export const snippetProblems = ({ language, code }: Snippet): string[] => {
  const problems: string[] = [];
  if (/^\s*;</m.test(code)) problems.push("starts JSX with a stray leading semicolon");
  if (
    /\buseState\s*[<(]/.test(code) &&
    !/React\.useState\s*[<(]/.test(code) &&
    !/import\s*{[^}]*\buseState\b[^}]*}\s*from\s*['"]react['"]/.test(code)
  ) {
    problems.push("uses useState without importing it");
  }
  const { diagnostics = [] } = ts.transpileModule(code, {
    fileName: `snippet.${language}`,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  return [
    ...problems,
    ...diagnostics
      .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
      .map(
        (diagnostic) =>
          `does not parse: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
      ),
  ];
};
