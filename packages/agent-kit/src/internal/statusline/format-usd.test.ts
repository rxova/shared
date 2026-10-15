import { describe, expect, it } from "vitest";
import { formatUsd } from "@/internal/statusline/format-usd";

describe("formatUsd", () => {
  it.each([
    [0, "$0.00"],
    [0.042, "$0.042"],
    [0.1, "$0.10"],
    [3.416, "$3.42"],
    [99.5, "$99.50"],
    [100, "$100"],
    [128.4, "$128"],
  ])("writes %f as %s", (usd, text) => {
    expect(formatUsd(usd)).toBe(text);
  });
});
