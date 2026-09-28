import { describe, expect, it } from "vitest";
import { splitFrontmatter } from "@/internal/changeset/split-frontmatter";

describe("splitFrontmatter", () => {
  it("returns the summary and the line it starts on", () => {
    expect(splitFrontmatter('---\n"a": patch\n---\n\nFix.\n')).toEqual({
      summary: "\nFix.\n",
      firstLine: 4,
    });
  });

  it("treats a file without closed frontmatter as all summary", () => {
    expect(splitFrontmatter("Fix.")).toEqual({ summary: "Fix.", firstLine: 1 });
    expect(splitFrontmatter('---\n"a": patch\n')).toEqual({
      summary: '---\n"a": patch\n',
      firstLine: 1,
    });
  });
});
