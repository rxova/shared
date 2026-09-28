#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { isEntry } from '@/internal/entry/is-entry';
import { runGuard } from '@/hooks/run-guard';

/**
 * The hook runner the installer copies next to the user's settings, built as one file with no
 * imports: `node hooks.js <guard>` reads the hook input from stdin.
 */
export const main = (
  argv: readonly string[],
  stdin: () => string,
  stderr: (line: string) => void,
): number => {
  let raw: string;
  try {
    raw = stdin();
  } catch {
    return 0;
  }
  const outcome = runGuard(argv[0] ?? '', raw);
  if (outcome.message !== undefined) stderr(outcome.message);
  return outcome.code;
};

/* v8 ignore start -- the process shell around `main`; the end-to-end test spawns it. */
if (isEntry(import.meta.url)) {
  process.exitCode = main(
    process.argv.slice(2),
    () => readFileSync(0, 'utf8'),
    (line) => process.stderr.write(`${line}\n`),
  );
}
/* v8 ignore stop */
