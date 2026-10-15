import { describe, expect, it } from "vitest";
import { sparkline } from "@/internal/statusline/sparkline";

describe("sparkline", () => {
  it("is empty for no values", () => {
    expect(sparkline([])).toBe("");
  });

  it("draws flat values, including a single one, at the lowest height", () => {
    expect(sparkline([7])).toBe("▁");
    expect(sparkline([5, 5, 5])).toBe("▁▁▁");
  });

  it("scales between the values' own lowest and highest", () => {
    expect(sparkline([0, 1, 2, 3, 4, 5, 6, 7])).toBe("▁▂▃▄▅▆▇█");
    expect(sparkline([20_000, 40_000, 60_000])).toBe("▁▅█");
    expect(sparkline([900, 100])).toBe("█▁");
  });
});
