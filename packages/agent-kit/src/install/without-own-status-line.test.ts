import { describe, expect, it } from "vitest";
import { withoutOwnStatusLine } from "@/install/without-own-status-line";

describe("withoutOwnStatusLine", () => {
  it("drops the kit's status line and keeps the rest", () => {
    const own = { type: "command", command: 'bash "/h/.claude/rx-ai/statusline.sh"' };
    expect(withoutOwnStatusLine({ model: "x", statusLine: own })).toEqual({ model: "x" });
  });

  it("keeps someone else's status line, or settings without one, as they were", () => {
    const theirs = { model: "x", statusLine: { type: "command", command: "mine.sh" } };
    expect(withoutOwnStatusLine(theirs)).toBe(theirs);
    const none = { model: "x" };
    expect(withoutOwnStatusLine(none)).toBe(none);
  });
});
