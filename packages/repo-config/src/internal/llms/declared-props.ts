import { existsSync, readFileSync } from "node:fs";
import ts from "typescript";

/**
 * Every property name declared in an interface or type literal in `file`, as
 * one flat set: a documented table often covers a surface assembled from
 * several interfaces, and the question is only whether a name still exists.
 * A missing file declares none.
 */
export const declaredProps = (file: string): Set<string> => {
  const names = new Set<string>();
  if (!existsSync(file)) return names;
  const visit = (node: ts.Node): void => {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeLiteralNode(node)) {
      for (const member of node.members) {
        if (!ts.isPropertySignature(member)) continue;
        if (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
          names.add(member.name.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true));
  return names;
};
