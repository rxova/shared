import { describe, expect, it } from "vitest";
import { withoutOwnHooks } from "@/install/without-own-hooks";

const own = { type: "command", command: 'node "/h/.claude/rx-ai/hooks.js" no-bypass' };
const theirs = { type: "command", command: "lint.sh" };

describe("withoutOwnHooks", () => {
  it("takes out only this kit’s commands, dropping what that empties", () => {
    expect(
      withoutOwnHooks({
        model: "x",
        hooks: {
          PreToolUse: [
            { matcher: "Bash", hooks: [own, theirs] },
            { matcher: "Edit", hooks: [own] },
          ],
          Stop: [{ hooks: [own] }],
        },
      }),
    ).toEqual({ model: "x", hooks: { PreToolUse: [{ matcher: "Bash", hooks: [theirs] }] } });
  });

  it("drops the hooks key when nothing is left", () => {
    expect(withoutOwnHooks({ hooks: { PreToolUse: [{ hooks: [own] }] } })).toEqual({});
  });

  it("keeps what was already empty before", () => {
    const empty = { hooks: { Stop: [], PreToolUse: [{ matcher: "x", hooks: [] }] } };
    expect(withoutOwnHooks(empty)).toEqual(empty);
    expect(withoutOwnHooks({ hooks: {} })).toEqual({ hooks: {} });
  });

  it("leaves shapes it does not understand alone", () => {
    const odd = {
      hooks: { PreToolUse: ["text", { matcher: "x" }, { hooks: [null, own] }], Other: "value" },
    };
    expect(withoutOwnHooks(odd)).toEqual({
      hooks: { PreToolUse: ["text", { matcher: "x" }, { hooks: [null] }], Other: "value" },
    });
    expect(withoutOwnHooks({ hooks: "none" })).toEqual({ hooks: "none" });
    expect(withoutOwnHooks({})).toEqual({});
  });
});
