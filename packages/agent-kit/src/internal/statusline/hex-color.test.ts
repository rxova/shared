import { describe, expect, it } from "vitest";
import { hexColor } from "@/internal/statusline/hex-color";

describe("hexColor", () => {
  it("pads each channel to two digits", () => {
    expect(hexColor([0, 0, 0])).toBe("#000000");
    expect(hexColor([1, 2, 3])).toBe("#010203");
  });

  it("writes the theme's colours as OpenTUI takes them", () => {
    expect(hexColor([203, 166, 247])).toBe("#cba6f7");
    expect(hexColor([255, 255, 255])).toBe("#ffffff");
  });

  it("rounds and clamps a channel outside 0 to 255", () => {
    expect(hexColor([-5, 127.6, 300])).toBe("#0080ff");
  });
});
