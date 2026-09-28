#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHook } from '@/hooks/run-hook';
import { isEntry } from '@/internal/entry/is-entry';
import { liveContext } from '@/internal/hooks/live-context';

/**
 * The hook runner the installer copies into `.claude/rx-ai/`, built as one file that imports only
 * Node: `node hooks.js <hook>` reads the hook input from stdin, writes the hook's message to
 * stderr and its reply to stdout, and returns the exit code.
 */
export const main = (
  argv: readonly string[],
  io: { stdin: () => string; stdout: (text: string) => void; stderr: (text: string) => void },
  run: (name: string, raw: string) => ReturnType<typeof runHook> = runHook,
): number => {
  let raw: string;
  try {
    raw = io.stdin();
  } catch {
    return 0;
  }
  const outcome = run(argv[0] ?? '', raw);
  if (outcome.stdout !== undefined) io.stdout(outcome.stdout);
  if (outcome.message !== undefined) io.stderr(outcome.message);
  return outcome.code;
};

/* v8 ignore start -- the process shell around `main`; the end-to-end test spawns it. */
if (isEntry(import.meta.url)) {
  const stateDir = join(dirname(fileURLToPath(import.meta.url)), 'state');
  process.exitCode = main(
    process.argv.slice(2),
    {
      stdin: () => readFileSync(0, 'utf8'),
      stdout: (text) => process.stdout.write(`${text}\n`),
      stderr: (text) => process.stderr.write(`${text}\n`),
    },
    (name, raw) => runHook(name, raw, liveContext(stateDir)),
  );
}
/* v8 ignore stop */
