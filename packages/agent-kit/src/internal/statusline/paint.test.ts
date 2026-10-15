import { describe, expect, it } from "vitest";
import { paint } from "@/internal/statusline/paint";

const ESC = "\u001b";

describe("paint", () => {
  it("returns the text untouched without colour", () => {
    expect(paint([1, 2, 3], "plain", "none", true)).toBe("plain");
  });

  it("adds no codes around empty text", () => {
    expect(paint([1, 2, 3], "", "truecolor", true)).toBe("");
    expect(paint([1, 2, 3], "", "256")).toBe("");
  });

  it("writes the exact RGB in truecolor, then resets", () => {
    expect(paint([243, 139, 168], "x", "truecolor")).toBe(`${ESC}[38;2;243;139;168mx${ESC}[0m`);
  });

  it("adds bold before the colour when asked", () => {
    expect(paint([1, 2, 3], "x", "truecolor", true)).toBe(`${ESC}[1;38;2;1;2;3mx${ESC}[0m`);
    expect(paint([0, 0, 0], "x", "256", true)).toBe(`${ESC}[1;38;5;16mx${ESC}[0m`);
  });

  it.each([
    [[0, 0, 0], 16],
    [[255, 255, 255], 231],
    [[255, 0, 0], 196],
    [[0, 255, 0], 46],
    [[0, 0, 255], 21],
    [[95, 135, 215], 68],
    [[175, 175, 175], 145],
    [[100, 100, 100], 59],
  ] as const)("maps %j to the nearest xterm cube colour %i in 256 mode", (rgb, index) => {
    expect(paint(rgb, "x", "256")).toBe(`${ESC}[38;5;${String(index)}mx${ESC}[0m`);
  });
});
