/**
 * The `next:` list `init` prints: each step is its lines, the first numbered
 * and the rest indented under it; empty steps are dropped before numbering.
 */
export const numberedSteps = (steps: readonly (readonly string[])[]): string[] => [
  "next:",
  ...steps
    .filter((lines) => lines.length > 0)
    .flatMap((lines, index) =>
      lines.map((line, at) => (at === 0 ? `  ${String(index + 1)}. ${line}` : `     ${line}`)),
    ),
];
