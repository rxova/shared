import { join, relative } from 'node:path';
import type { HookSpec } from '@/hooks/hook.types';
import { latestNote } from '@/internal/hooks/latest-note';

/**
 * When a session starts: points the agent at the newest handoff note in `.claude/handoff/`
 * (a week at most), or failing that the newest automatic snapshot (two days), so work picks up
 * where it stopped. Says nothing when there is neither.
 */
export const handoffReminder: HookSpec = {
  on: [{ event: 'SessionStart' }],
  timeout: 5,
  summary: 'at session start, point the agent at the latest handoff note or snapshot',
  run: (input, context) => {
    const cwd = input.cwd;
    if (cwd === undefined) return { code: 0 };
    const dir = join(cwd, '.claude', 'handoff');
    const note = latestNote(dir, 7, context) ?? latestNote(join(dir, 'auto'), 2, context);
    if (note === undefined) return { code: 0 };
    return {
      code: 0,
      stdout:
        `rx-ai: the latest handoff note for this project is ${relative(cwd, note.path)} (${note.date}). ` +
        'If this session continues that work, read it before doing anything else.',
    };
  },
};
