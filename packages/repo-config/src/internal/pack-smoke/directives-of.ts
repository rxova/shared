/**
 * The directives a JavaScript or TypeScript module opens with — `'use client'`,
 * `"use strict"` — in order, read from its directive prologue: the string
 * statements before anything else, past a hashbang, comments and whitespace.
 */
export const directivesOf = (source: string): string[] => {
  const skip = /^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*/;
  const statement = /^(['"])([^'"\\\n]*)\1\s*;?/;
  let rest = source.replace(/^#![^\n]*/, '');
  const found: string[] = [];
  for (;;) {
    rest = rest.replace(skip, '');
    const match = statement.exec(rest);
    if (match === null) return found;
    found.push(String(match[2]));
    rest = rest.slice(match[0].length);
  }
};
