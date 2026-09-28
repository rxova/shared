import { describe, expect, it } from "vitest";
import { countOwnHooks } from "@/internal/install/count-own-hooks";

const own = { type: "command", command: 'node "/h/.claude/rx-ai/hooks.js" no-bypass' };

describe("countOwnHooks", () => {
  it("counts this kit’s commands across events and groups", () => {
    expect(
      countOwnHooks({
        hooks: {
          PreToolUse: [{ hooks: [own, own, { command: "other" }] }, "odd", { matcher: "x" }],
          Stop: [{ hooks: [own, null] }],
          Broken: "not a list",
        },
      }),
    ).toBe(3);
  });

  it("is 0 without a hooks object", () => {
    expect(countOwnHooks({})).toBe(0);
    expect(countOwnHooks({ hooks: [] })).toBe(0);
  });
});
