import { describe, expect, it } from "vitest";
import { withOwnStatusLine } from "@/install/with-own-status-line";

describe("withOwnStatusLine", () => {
  it("points statusLine at the script, replacing what was there", () => {
    expect(
      withOwnStatusLine(
        { model: "x", statusLine: { command: "mine.sh" } },
        "/h/rx-ai/statusline.sh",
      ),
    ).toEqual({
      model: "x",
      statusLine: { type: "command", command: 'bash "/h/rx-ai/statusline.sh"' },
    });
  });

  it("takes only the kit's own status line out when there is no script", () => {
    const own = { command: 'bash "/h/rx-ai/statusline.sh"' };
    expect(withOwnStatusLine({ model: "x", statusLine: own }, undefined)).toEqual({ model: "x" });
    const theirs = { statusLine: { command: "mine.sh" } };
    expect(withOwnStatusLine(theirs, undefined)).toBe(theirs);
  });
});
