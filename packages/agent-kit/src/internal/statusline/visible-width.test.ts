import { describe, expect, it } from "vitest";
import { hyperlink } from "@/internal/statusline/hyperlink";
import { paint } from "@/internal/statusline/paint";
import { visibleWidth } from "@/internal/statusline/visible-width";

describe("visibleWidth", () => {
  it("counts plain characters", () => {
    expect(visibleWidth("")).toBe(0);
    expect(visibleWidth("abc")).toBe(3);
    expect(visibleWidth("  │  ")).toBe(5);
  });

  it("ignores colour codes", () => {
    expect(visibleWidth(paint([1, 2, 3], "hello", "truecolor", true))).toBe(5);
    expect(visibleWidth(`a${paint([1, 2, 3], "bc", "256")}d`)).toBe(4);
  });

  it("ignores hyperlink wrappers ended by BEL or by ESC \\", () => {
    expect(visibleWidth(hyperlink("https://x.test/1", "PR #1"))).toBe(5);
    expect(visibleWidth("\u001b]8;;https://x.test\u001b\\link\u001b]8;;\u001b\\")).toBe(4);
  });

  it("drops an unterminated escape to the end of the text", () => {
    expect(visibleWidth("ab\u001b[31")).toBe(2);
    expect(visibleWidth("ab\u001b]8;;https://x.test")).toBe(2);
  });

  it("counts a lone ESC as a character", () => {
    expect(visibleWidth("a\u001bb")).toBe(3);
  });

  it("counts each grapheme once", () => {
    expect(visibleWidth("é")).toBe(1);
    expect(visibleWidth("👍🏽!")).toBe(2);
    expect(visibleWidth("◆ ⎇ ●○")).toBe(6);
  });
});
