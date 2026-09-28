import { join } from "node:path";
import type { HookContext } from "@/hooks/hook.types";

/**
 * The newest note in `dir` no older than `maxDays`, by the `yyyy-mm-dd` its name starts with;
 * undefined when there is none.
 */
export const latestNote = (
  dir: string,
  maxDays: number,
  context: HookContext,
): { path: string; date: string } | undefined => {
  const oldest = new Date(context.now().getTime() - maxDays * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const name = context
    .list(dir)
    .filter((file) => /^\d{4}-\d{2}-\d{2}.*\.md$/.test(file) && file.slice(0, 10) >= oldest)
    .sort()
    .pop();
  return name === undefined ? undefined : { path: join(dir, name), date: name.slice(0, 10) };
};
