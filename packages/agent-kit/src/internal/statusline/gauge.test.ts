import { describe, expect, it } from "vitest";
import { gauge } from "@/internal/statusline/gauge";

describe("gauge", () => {
  it("is all track when empty and all block when full", () => {
    expect(gauge(0, 16)).toEqual({ filled: "", empty: "─".repeat(16) });
    expect(gauge(1, 16)).toEqual({ filled: "█".repeat(16), empty: "" });
  });

  it("splits a whole number of cells", () => {
    expect(gauge(0.5, 10)).toEqual({ filled: "█████", empty: "─────" });
  });

  it("draws the remainder as a partial block that takes a cell of its own", () => {
    expect(gauge(0.05, 10)).toEqual({ filled: "▌", empty: "─".repeat(9) });
    expect(gauge(0.0125, 10)).toEqual({ filled: "▏", empty: "─".repeat(9) });
    expect(gauge(0.1875, 10)).toEqual({ filled: "█▉", empty: "─".repeat(8) });
  });

  it("keeps the bar exactly `width` cells for any fraction", () => {
    for (let step = 0; step <= 80; step += 1) {
      const { filled, empty } = gauge(step / 80, 10);
      expect(filled.length + empty.length).toBe(10);
    }
  });

  it("clamps fractions outside 0 to 1", () => {
    expect(gauge(-0.5, 4)).toEqual({ filled: "", empty: "────" });
    expect(gauge(1.5, 4)).toEqual({ filled: "████", empty: "" });
  });
});
