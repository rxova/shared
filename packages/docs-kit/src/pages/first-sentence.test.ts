import { describe, expect, it } from "vitest";
import { firstSentence } from "@/pages/first-sentence";

describe("firstSentence", () => {
  it("ignores code fences, contents included", () => {
    const body = [
      "```diff",
      "- statements: 95,",
      "```",
      "A coverage threshold is a promise about the suite.",
    ].join("\n");
    expect(firstSentence(body)).toBe("A coverage threshold is a promise about the suite.");
  });

  it("skips headings, JSX, imports, directives and tables", () => {
    const body = [
      "# Title",
      "<Aside>",
      "import x from 'y';",
      ":::note",
      "| a | b |",
      "---",
      "The real first sentence is here.",
    ].join("\n");
    expect(firstSentence(body)).toBe("The real first sentence is here.");
  });

  it("collapses a link to its text", () => {
    expect(firstSentence("It grades every [deleted file](../rules/x.md#d) on recovery.")).toBe(
      "It grades every deleted file on recovery.",
    );
  });

  it("strips emphasis before matching, not after", () => {
    expect(firstSentence("**overlock** reads a patch and nothing else.")).toBe(
      "overlock reads a patch and nothing else.",
    );
  });

  it("truncates on a word boundary when no sentence fits", () => {
    const found = firstSentence(`${"word ".repeat(80)}ends here.`) ?? "";
    expect(found.length).toBeLessThanOrEqual(201);
    expect(found.endsWith("word…")).toBe(true);
  });

  it("cuts mid-word when there is no space to cut at, and drops trailing punctuation", () => {
    expect(firstSentence("x".repeat(250))).toBe(`${"x".repeat(200)}…`);
    expect(firstSentence(`${"a".repeat(25)} ${"b".repeat(172)}, c ${"d".repeat(30)}`)).toBe(
      `${"a".repeat(25)} ${"b".repeat(172)}…`,
    );
  });

  it("gives up on a body with nothing to summarise", () => {
    expect(firstSentence("```console\n$ overlock\n```")).toBeUndefined();
    expect(firstSentence("Too short")).toBeUndefined();
  });
});
