import { describe, expect, it } from 'vitest';
import { singlePackageProblems } from './single-package-problems.ts';

describe('singlePackageProblems', () => {
  it('flags an unreadable file', () => {
    expect(singlePackageProblems(['x.md'], () => undefined)).toEqual(['  x.md: could not be read']);
  });

  it('passes a changeset naming one package and flags one naming two, by count', () => {
    const files = {
      'one.md': "---\n'@rxova/example': patch\n---\n\nFix.\n",
      'two.md': '---\n"a": patch\n"b": minor\n---\n',
    };
    expect(
      singlePackageProblems(Object.keys(files), (file) => files[file as keyof typeof files]),
    ).toEqual(['  two.md: names 2 packages, expected 1']);
  });
});
