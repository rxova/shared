import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The context token counts recorded for `sessionId` in `dir`, with `tokens` appended when it
 * differs from the last one, keeping the latest 24. The status line runs many times per turn, so
 * a repeat is the same turn. Fails open: an unreadable or unwritable file only loses the history.
 */
export const sessionHistory = (
  dir: string,
  sessionId: string,
  tokens: number | undefined,
): number[] => {
  const safe = sessionId.replace(/[^\w-]/g, "");
  if (safe === "" || tokens === undefined) return tokens === undefined ? [] : [tokens];
  const file = join(dir, `${safe}.json`);
  let history: number[] = [];
  try {
    const stored: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (Array.isArray(stored))
      history = stored.filter((value): value is number => typeof value === "number");
  } catch {
    history = [];
  }
  if (history.at(-1) === tokens) return history;
  const next = [...history, tokens].slice(-24);
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, JSON.stringify(next));
  } catch {
    // The history is a nicety; the status line still renders without it.
  }
  return next;
};
