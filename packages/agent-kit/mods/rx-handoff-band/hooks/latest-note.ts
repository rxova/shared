import type { HandoffNote } from "../types";

const DAY_MS = 86_400_000;

/** The newest `yyyy-mm-dd*.md` note among `names` no older than `maxDays`, or null. */
export const latestNote = (
  names: readonly string[],
  nowMs: number,
  maxDays: number,
): HandoffNote | null => {
  const oldest = new Date(nowMs - maxDays * DAY_MS).toISOString().slice(0, 10);
  const name = names
    .filter((file) => /^\d{4}-\d{2}-\d{2}.*\.md$/.test(file) && file.slice(0, 10) >= oldest)
    .sort()
    .pop();
  if (name === undefined) {
    return null;
  }

  const date = name.slice(0, 10);
  const ageDays = Math.max(0, Math.floor((nowMs - Date.parse(`${date}T00:00:00Z`)) / DAY_MS));

  return { path: `.claude/handoff/${name}`, date, ageDays };
};
