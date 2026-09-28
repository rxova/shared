import type { HookSpec } from "@/hooks/hook.types";
import { hooks } from "@/hooks/hooks-table";

/** The chosen hooks grouped by where the OpenCode plugin runs them. */
export interface OpencodeHooks {
  before: { matcher: string; names: string[] }[];
  after: { matcher: string; names: string[] }[];
  compacting: string[];
  start: string[];
}

/**
 * The chosen hooks sorted onto the OpenCode plugin's events: tool hooks before and after a tool
 * call (by matcher), `PreCompact` on compaction, `SessionStart` when a session is created.
 * `SessionEnd` has no OpenCode event, and `context-nudge` reads Claude Code's transcript, so
 * neither runs there.
 */
export const opencodeHooks = (
  names: readonly string[],
  table: Readonly<Record<string, HookSpec>> = hooks,
): OpencodeHooks => {
  const grouped: OpencodeHooks = { before: [], after: [], compacting: [], start: [] };
  const add = (list: OpencodeHooks["before"], matcher: string, name: string) => {
    let group = list.find((entry) => entry.matcher === matcher);
    if (group === undefined) {
      group = { matcher, names: [] };
      list.push(group);
    }
    group.names.push(name);
  };
  for (const [name, spec] of Object.entries(table)) {
    if (!names.includes(name) || name === "context-nudge") continue;
    for (const { event, matcher } of spec.on) {
      if (event === "PreToolUse") add(grouped.before, matcher ?? "*", name);
      else if (event === "PostToolUse") add(grouped.after, matcher ?? "*", name);
      else if (event === "PreCompact") grouped.compacting.push(name);
      else if (event === "SessionStart") grouped.start.push(name);
    }
  }
  return grouped;
};
