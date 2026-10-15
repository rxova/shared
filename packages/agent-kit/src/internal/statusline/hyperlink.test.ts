import { describe, expect, it } from "vitest";
import { hyperlink } from "@/internal/statusline/hyperlink";

describe("hyperlink", () => {
  it("wraps the text in an OSC 8 link", () => {
    expect(hyperlink("https://example.com/pr/1", "PR #1")).toBe(
      "\u001b]8;;https://example.com/pr/1\u0007PR #1\u001b]8;;\u0007",
    );
  });

  it("returns the bare text without a url", () => {
    expect(hyperlink(undefined, "PR #1")).toBe("PR #1");
    expect(hyperlink("", "PR #1")).toBe("PR #1");
  });
});
