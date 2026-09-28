import { describe, expect, it } from "vitest";
import { contextNudge } from "@/hooks/context-nudge";
import { contextWith } from "@/internal/hooks/context.fixtures";
import { transcript } from "@/internal/hooks/transcript.fixtures";

const input = { session_id: "s/1", transcript_path: "/t.jsonl" };
const nudge = (
  tokens: number,
  files: Record<string, string> = {},
  env: Record<string, string> = {},
) => {
  const context = contextWith({ files: { "/t.jsonl": transcript(tokens), ...files }, env });
  return { outcome: contextNudge.run(input, context), context };
};
const said = (stdout: string | undefined) =>
  (JSON.parse(stdout ?? "{}") as { hookSpecificOutput: { additionalContext: string } })
    .hookSpecificOutput.additionalContext;

describe("contextNudge", () => {
  it("stays quiet under 60% of the window", () => {
    expect(nudge(100_000).outcome).toEqual({ code: 0 });
  });

  it("nudges once at 60% and again at 80%, remembering per session", () => {
    const first = nudge(130_000);
    expect(said(first.outcome.stdout)).toContain("about 60% full");
    expect(first.context.files["/state/nudge-s1.json"]).toBe("1");
    expect(nudge(140_000, { "/state/nudge-s1.json": "1" }).outcome).toEqual({ code: 0 });
    const later = nudge(170_000, { "/state/nudge-s1.json": "1" });
    expect(said(later.outcome.stdout)).toContain("over 80% full");
    expect(nudge(190_000, { "/state/nudge-s1.json": "2" }).outcome).toEqual({ code: 0 });
  });

  it("takes the window size from RX_AI_CONTEXT_WINDOW", () => {
    expect(nudge(170_000, {}, { RX_AI_CONTEXT_WINDOW: "1000000" }).outcome).toEqual({ code: 0 });
    expect(nudge(170_000, {}, { RX_AI_CONTEXT_WINDOW: "lots" }).outcome.stdout).toBeDefined();
  });

  it("does nothing without a session, a transcript, or usage in it", () => {
    const context = contextWith({ files: { "/t.jsonl": '{"type":"user"}' } });
    expect(contextNudge.run({ transcript_path: "/t.jsonl" }, context)).toEqual({ code: 0 });
    expect(contextNudge.run({ session_id: "s" }, context)).toEqual({ code: 0 });
    expect(contextNudge.run(input, context)).toEqual({ code: 0 });
    expect(contextNudge.run({ ...input, transcript_path: "/missing" }, context)).toEqual({
      code: 0,
    });
  });
});
