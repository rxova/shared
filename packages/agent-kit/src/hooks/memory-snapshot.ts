import { join } from "node:path";
import type { HookSpec } from "@/hooks/hook.types";
import { editedFiles } from "@/internal/hooks/edited-files";
import { gitOutput } from "@/internal/hooks/git-output";
import { snapshotNote } from "@/internal/hooks/snapshot-note";
import { transcriptEntries } from "@/internal/hooks/transcript-entries";
import { userPrompts } from "@/internal/hooks/user-prompts";
import { KEEP } from "@/internal/hooks/snapshots-kept";

/**
 * Before the context is compacted and when a session ends: writes a snapshot of where things
 * stand (branch, uncommitted files, recent commits, files edited, the last requests) to
 * `.claude/handoff/auto/`, git-ignored, keeping the last ten.
 */
export const memorySnapshot: HookSpec = {
  on: [{ event: "PreCompact" }, { event: "SessionEnd" }],
  timeout: 10,
  summary: "before compaction and at session end, save a snapshot note to .claude/handoff/auto/",
  run: (input, context) => {
    const cwd = input.cwd;
    if (cwd === undefined) return { code: 0 };
    const dir = join(cwd, ".claude", "handoff", "auto");
    const entries = transcriptEntries(
      input.transcript_path === undefined ? "" : (context.read(input.transcript_path) ?? ""),
    );
    const at = context.now().toISOString().slice(0, 16);
    const event = input.hook_event_name ?? "snapshot";
    context.write(join(dir, ".gitignore"), "*\n");
    context.write(
      join(dir, `${at.replace(/[:T]/g, "-")}-${event}.md`),
      snapshotNote({
        event,
        at: `${at.replace("T", " ")} UTC`,
        branch: gitOutput(context, cwd, ["rev-parse", "--abbrev-ref", "HEAD"]),
        status: gitOutput(context, cwd, ["status", "--short"]),
        commits: gitOutput(context, cwd, ["log", "--oneline", "-5"]),
        edited: editedFiles(entries),
        prompts: userPrompts(entries).slice(-5),
      }),
    );
    const notes = context
      .list(dir)
      .filter((name) => name.endsWith(".md"))
      .sort();
    for (const stale of notes.slice(0, Math.max(0, notes.length - KEEP)))
      context.remove(join(dir, stale));
    return { code: 0 };
  },
};
