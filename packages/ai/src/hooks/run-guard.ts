import type { GuardFiles, HookInput } from '@/hooks/guard.types';
import { guards } from '@/hooks/guards';
import { diskFiles } from '@/internal/hooks/disk-files';
import { switchedOff } from '@/internal/hooks/switched-off';

/** What the hook process should do: its exit code, and a line for stderr when it blocks. */
export interface GuardOutcome {
  code: 0 | 2;
  message?: string;
}

/**
 * Runs one guard over the raw hook input. Exit code 2 blocks the tool call and shows the
 * message to the agent. Anything unexpected (an unknown or switched-off guard, input that is
 * not JSON, a guard that throws) lets the call through: a guard must never wedge a session.
 */
export const runGuard = (
  name: string,
  raw: string,
  { off = process.env.RX_AI_OFF, files = diskFiles }: { off?: string; files?: GuardFiles } = {},
): GuardOutcome => {
  if (!Object.hasOwn(guards, name) || switchedOff(off).has(name)) return { code: 0 };
  try {
    const input = JSON.parse(raw) as HookInput;
    const verdict = guards[name as keyof typeof guards].guard(input, files);
    return verdict.block ? { code: 2, message: `rx-ai ${name}: ${verdict.reason}` } : { code: 0 };
  } catch {
    return { code: 0 };
  }
};
