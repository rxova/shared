import { describe, expect, it } from "vitest";
import { run } from "@/internal/statusline/run";

describe("run", () => {
  it("carries the colour rather than escape codes", () => {
    expect(run([1, 2, 3], "x")).toEqual({
      text: "x",
      rgb: [1, 2, 3],
      bold: false,
      href: undefined,
    });
  });

  it("takes bold and a hyperlink", () => {
    expect(run([1, 2, 3], "x", true, "https://example.test")).toEqual({
      text: "x",
      rgb: [1, 2, 3],
      bold: true,
      href: "https://example.test",
    });
  });
});
