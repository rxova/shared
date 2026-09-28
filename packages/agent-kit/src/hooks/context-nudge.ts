import { join } from 'node:path';
import type { HookSpec } from '@/hooks/hook.types';
import { contextTokens } from '@/internal/hooks/context-tokens';
import { nudgeMessage } from '@/internal/hooks/nudge-message';
import { transcriptEntries } from '@/internal/hooks/transcript-entries';
import { TAIL } from '@/internal/hooks/transcript-tail';

/**
 * After each tool call: reads how full the context window is from the transcript, and once per
 * level (60%, then 80%) tells the agent to reach a break, write a handoff note and suggest a
 * compact. The window is 200k tokens unless `RX_AI_CONTEXT_WINDOW` says otherwise.
 */
export const contextNudge: HookSpec = {
  on: [{ event: 'PostToolUse', matcher: '*' }],
  timeout: 5,
  summary: 'remind the agent to hand off and compact when the context is 60% and 80% full',
  run: (input, context) => {
    if (input.transcript_path === undefined || input.session_id === undefined) return { code: 0 };
    const tokens = contextTokens(
      transcriptEntries((context.read(input.transcript_path) ?? '').slice(-TAIL)),
    );
    if (tokens === undefined) return { code: 0 };
    const window = Number(context.env.RX_AI_CONTEXT_WINDOW) || 200_000;
    const band = tokens >= window * 0.8 ? 2 : tokens >= window * 0.6 ? 1 : 0;

    const stateFile = join(
      context.stateDir,
      `nudge-${input.session_id.replace(/[^\w-]/g, '')}.json`,
    );
    const previous = Number((context.read(stateFile) ?? '').trim()) || 0;
    if (band <= previous) return { code: 0 };
    context.write(stateFile, String(band));
    return {
      code: 0,
      stdout: JSON.stringify({
        hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: nudgeMessage(band) },
      }),
    };
  },
};
