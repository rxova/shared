/**
 * The names in the first column of every table under `## Props`, up to the
 * next `## ` heading: a component's props, which may be kebab-case attributes.
 * Rows whose first cell is not one backticked name are skipped.
 */
export const documentedProps = (body: string): string[] => {
  const lines = body.split("\n");
  const start = lines.findIndex((line) => line.trim() === "## Props");
  if (start === -1) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return (end === -1 ? rest : rest.slice(0, end)).flatMap((line) => {
    const name = /^\|\s*`([A-Za-z_$][\w$-]*)`\s*\|/.exec(line)?.[1];
    return name === undefined ? [] : [name];
  });
};
