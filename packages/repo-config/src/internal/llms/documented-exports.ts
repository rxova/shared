/**
 * The names in the first column of every table under `## API`, up to the next
 * `## ` heading. Rows whose first cell is not one backticked identifier (the
 * header, the `| --- |` separator) are skipped.
 *
 * Sliced line by line: a single regex with a `\s*$` lookahead stops at the
 * first position, reads every table as empty, and passes every file.
 */
export const documentedExports = (body: string): string[] => {
  const lines = body.split('\n');
  const start = lines.findIndex((line) => line.trim() === '## API');
  if (start === -1) return [];

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith('## '));

  return (end === -1 ? rest : rest.slice(0, end)).flatMap((line) => {
    const name = /^\|\s*`([A-Za-z_$][\w$]*)`/.exec(line)?.[1];
    return name === undefined ? [] : [name];
  });
};
