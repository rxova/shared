import type { Git } from '../../tooling/src/scope.types.ts';

/** True when the only edited lines in a file are its `"version":` line. */
export const versionBumpOnly = (
  file: string,
  range: { base: string; head: string },
  run: Git,
): boolean => {
  const edits = run('diff', '--unified=0', `${range.base}...${range.head}`, '--', file)
    .split('\n')
    .filter((line) => /^[+-]/.test(line) && !/^(\+\+\+|---)/.test(line));
  return edits.length > 0 && edits.every((line) => /^[+-]\s*"version":\s*"[^"]*",?\s*$/.test(line));
};
