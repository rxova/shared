import { describe, expect, it } from "vitest";
import { handoffReminder } from "@/hooks/handoff-reminder";
import { contextWith } from "@/internal/hooks/context.fixtures";

const run = (files: Record<string, string>) =>
  handoffReminder.run({ cwd: "/repo" }, contextWith({ files }));

describe("handoffReminder", () => {
  it("points at the newest handoff note from the last week", () => {
    expect(
      run({
        "/repo/.claude/handoff/2026-09-25-auth.md": "",
        "/repo/.claude/handoff/2026-09-27-login.md": "",
        "/repo/.claude/handoff/notes.txt": "",
      }),
    ).toEqual({
      code: 0,
      stdout: expect.stringContaining(".claude/handoff/2026-09-27-login.md (2026-09-27)") as string,
    });
  });

  it("falls back to a snapshot from the last two days", () => {
    expect(
      run({
        "/repo/.claude/handoff/2026-09-01-old.md": "",
        "/repo/.claude/handoff/auto/2026-09-27-18-00-SessionEnd.md": "",
      }).stdout,
    ).toContain("auto/2026-09-27-18-00-SessionEnd.md");
  });

  it("says nothing when every note is stale, or there are none", () => {
    expect(run({ "/repo/.claude/handoff/auto/2026-09-20-00-00-SessionEnd.md": "" })).toEqual({
      code: 0,
    });
    expect(run({})).toEqual({ code: 0 });
    expect(handoffReminder.run({}, contextWith())).toEqual({ code: 0 });
  });
});
