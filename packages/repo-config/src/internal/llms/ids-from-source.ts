import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

/**
 * The strings of the `as const` array exported as `NAME` from the file a
 * `path/to/file.ts#NAME` reference points at (relative to `root`): the rule
 * ids, command names or codes an `llms.txt` must mention. Read from the
 * syntax tree, not by running the module, so it needs no build.
 */
export const idsFromSource = (root: string, reference: string): string[] => {
  const [path = '', name = ''] = reference.split('#');
  const file = join(root, path);
  if (!existsSync(file)) throw new Error(`repoConfig.llms.idsFrom: ${path} does not exist`);
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== name) continue;
      let value = declaration.initializer;
      while (value !== undefined && (ts.isAsExpression(value) || ts.isSatisfiesExpression(value))) {
        value = value.expression;
      }
      if (value === undefined || !ts.isArrayLiteralExpression(value)) break;
      return value.elements.map((element) => {
        if (!ts.isStringLiteralLike(element)) {
          throw new Error(
            `repoConfig.llms.idsFrom: ${name} in ${path} holds something other than strings`,
          );
        }
        return element.text;
      });
    }
  }
  throw new Error(`repoConfig.llms.idsFrom: ${path} declares no array of strings named ${name}`);
};
