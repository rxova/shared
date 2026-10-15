import { describe, expect, it } from "vitest";
import { formatTokens } from "@/internal/statusline/format-tokens";

describe("formatTokens", () => {
  it.each([
    [0, "0"],
    [842, "842"],
    [999, "999"],
    [1000, "1k"],
    [12_345, "12.3k"],
    [99_949, "99.9k"],
    [100_000, "100k"],
    [186_400, "186k"],
    [1_000_000, "1M"],
    [999_999, "1M"],
    [999.6, "1k"],
    [1_234_567, "1.2M"],
  ])("writes %i as %s", (tokens, text) => {
    expect(formatTokens(tokens)).toBe(text);
  });
});
