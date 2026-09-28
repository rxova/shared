import type { HookContext } from '@/hooks/hook.types';

/** Stdout without its trailing newline of a git command run in `cwd`, or undefined when it failed. */
export const gitOutput = (
  context: HookContext,
  cwd: string,
  args: readonly string[],
): string | undefined => {
  const result = context.run('git', args, cwd, 3000);
  return result.status === 0 ? result.stdout.trimEnd() : undefined;
};
