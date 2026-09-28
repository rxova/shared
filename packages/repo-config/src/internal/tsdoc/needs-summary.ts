import ts from 'typescript';

/**
 * Whether an export is callable, and so needs a summary: a function or method
 * declaration, or a variable whose type has a call signature (an arrow
 * function, a factory's return). Types, interfaces and plain constants explain
 * themselves through their members.
 */
export const needsSummary = (
  symbol: ts.Symbol,
  declarations: readonly ts.Declaration[],
  checker: ts.TypeChecker,
): boolean => {
  if (
    declarations.some(
      (declaration) =>
        ts.isFunctionDeclaration(declaration) ||
        ts.isMethodDeclaration(declaration) ||
        ts.isMethodSignature(declaration),
    )
  ) {
    return true;
  }
  const variable = declarations.find((declaration) => ts.isVariableDeclaration(declaration));
  if (variable === undefined) return false;
  return checker.getTypeOfSymbolAtLocation(symbol, variable).getCallSignatures().length > 0;
};
