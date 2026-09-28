import type { Guard } from '@/hooks/guard.types';
import { allow } from '@/internal/hooks/allow';
import { BYPASS_FIX } from '@/internal/hooks/bypass-fix';
import { bashCommand } from '@/internal/hooks/bash-command';
import { movesHooksPath } from '@/internal/hooks/moves-hooks-path';
import { skipsVerification } from '@/internal/hooks/skips-verification';
import { gitCall } from '@/internal/shell/git-call';
import { shellSegments } from '@/internal/shell/shell-segments';

/**
 * Stops git calls that get past the repository's hooks: `--no-verify`, `git commit -n`,
 * `HUSKY=0`, and anything that moves or clears `core.hooksPath`.
 */
export const noBypass: Guard = (input) => {
  const command = bashCommand(input);
  if (command === undefined) return allow;
  for (const words of shellSegments(command)) {
    const call = gitCall(words);
    if (call === undefined) continue;
    if (call.env.includes('HUSKY=0'))
      return {
        block: true,
        reason: `HUSKY=0 switches off the repository's git hooks. ${BYPASS_FIX}`,
      };
    if (movesHooksPath(call))
      return {
        block: true,
        reason: `Changing core.hooksPath skips the repository's git hooks. ${BYPASS_FIX}`,
      };
    if (skipsVerification(call))
      return {
        block: true,
        reason: `git ${call.subcommand} is set to skip its hooks. ${BYPASS_FIX}`,
      };
  }
  return allow;
};
