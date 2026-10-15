import { describe, expect, it } from "vitest";
import { colorMode } from "@/internal/statusline/color-mode";

describe("colorMode", () => {
  it.each(["truecolor", "256", "none"] as const)(
    "takes RX_STATUSLINE_COLOR=%s over every guess",
    (wanted) => {
      expect(colorMode({ RX_STATUSLINE_COLOR: wanted, NO_COLOR: "1", COLORTERM: "24bit" })).toBe(
        wanted,
      );
    },
  );

  it("turns colour off when NO_COLOR is set to anything", () => {
    expect(colorMode({ NO_COLOR: "1", COLORTERM: "truecolor" })).toBe("none");
  });

  it("ignores an empty NO_COLOR and an unknown RX_STATUSLINE_COLOR", () => {
    expect(colorMode({ NO_COLOR: "", RX_STATUSLINE_COLOR: "16" })).toBe("256");
  });

  it.each(["truecolor", "24bit"])("uses 24-bit colour when COLORTERM=%s", (colorterm) => {
    expect(colorMode({ COLORTERM: colorterm })).toBe("truecolor");
  });

  it("falls back to the 256-colour palette", () => {
    expect(colorMode({})).toBe("256");
    expect(colorMode({ COLORTERM: "yes" })).toBe("256");
  });
});
