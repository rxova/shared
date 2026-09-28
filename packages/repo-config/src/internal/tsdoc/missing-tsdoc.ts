import { dirname, join, relative } from 'node:path';
import ts from 'typescript';
import type { TsdocSource } from '@/internal/tsdoc/tsdoc-sources';
import { needsSummary } from '@/internal/tsdoc/needs-summary';

/**
 * The callable exports of `source`'s entry that carry no TSDoc summary, as
 * `{ name, where }` with `where` the `file:line` of the declaration relative
 * to `root`, sorted by name. Re-exports are followed to the declaration, so
 * the comment is the one an editor shows on hover. `exclude` names exports
 * that need none.
 */
export const missingTsdoc = (
  source: TsdocSource,
  root: string,
  exclude: readonly string[] = [],
): { name: string; where: string }[] => {
  const entry = join(root, source.entry);
  let options: ts.CompilerOptions = {};
  if (source.tsconfig !== undefined) {
    const path = join(root, source.tsconfig);
    const loaded = ts.readConfigFile(path, (file) => ts.sys.readFile(file));
    const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, dirname(path), {}, path);
    const [problem] = [...(loaded.error ? [loaded.error] : []), ...parsed.errors];
    if (problem !== undefined) {
      throw new Error(
        `${source.tsconfig}: ${ts.flattenDiagnosticMessageText(problem.messageText, ' ')}`,
      );
    }
    options = parsed.options;
  }
  const program = ts.createProgram({ rootNames: [entry], options: { ...options, noEmit: true } });
  const checker = program.getTypeChecker();
  const file = program.getSourceFile(entry);
  const module = file && checker.getSymbolAtLocation(file);
  if (module === undefined) throw new Error(`${source.entry} is not a module`);

  return checker
    .getExportsOfModule(module)
    .filter((symbol) => symbol.name !== 'default' && !exclude.includes(symbol.name))
    .flatMap((symbol) => {
      const target =
        (symbol.flags & ts.SymbolFlags.Alias) !== 0 ? checker.getAliasedSymbol(symbol) : symbol;
      const { declarations = [] } = target;
      if (!needsSummary(target, declarations, checker)) return [];
      if (ts.displayPartsToString(target.getDocumentationComment(checker)).trim() !== '') return [];
      // needsSummary is false without a declaration, so there is a first one.
      return declarations.slice(0, 1).map((first) => {
        const at = first.getSourceFile();
        const { line } = at.getLineAndCharacterOfPosition(first.getStart(at));
        const path = relative(root, at.fileName).replaceAll('\\', '/');
        return { name: symbol.name, where: `${path}:${String(line + 1)}` };
      });
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};
