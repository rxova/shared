import type { HookContext, HookOutcome } from '@/hooks/hook.types';
import { runHook } from '@/hooks/run-hook';
import { liveContext } from '@/internal/hooks/live-context';

/**
 * Runs several hooks, named in a comma-separated list, over the same input, in order. The first
 * one that blocks ends the run with its outcome; replies on stdout are joined. One process for a
 * whole event, instead of one per hook.
 */
export const runHooks = (
  names: string,
  raw: string,
  context: HookContext = liveContext(),
): HookOutcome => {
  const replies: string[] = [];
  for (const name of names
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '')) {
    const outcome = runHook(name, raw, context);
    if (outcome.stdout !== undefined) replies.push(outcome.stdout);
    if (outcome.code === 2)
      return { ...outcome, ...(replies.length > 0 && { stdout: replies.join('\n') }) };
  }
  return replies.length > 0 ? { code: 0, stdout: replies.join('\n') } : { code: 0 };
};
