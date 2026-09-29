import { describe, expect, it } from "vitest";
import { fakePage, fakePages } from "@/llms/llms.fixtures";
import { llmsFull } from "@/llms/llms-full";

describe("llmsFull", () => {
  it("repeats the header and inlines each page with its source", () => {
    const text = llmsFull([fakePage("index", "root")], { project: "x", summary: ["One line."] });
    expect(text).toBe(
      [
        "# x",
        "",
        "> One line.",
        "",
        "---",
        "",
        "# index",
        "",
        "Source: https://rxova.dev/index/",
        "",
        "Body of index",
        "",
      ].join("\n"),
    );
  });

  it("inlines in index order, optional pages last", () => {
    const text = llmsFull(fakePages(), {
      project: "x",
      summary: [],
      sections: [["learn", "Learn"]],
      optional: { match: (s) => s.startsWith("api:") },
    });
    const order = [...text.matchAll(/^# (.+)$/gm)].map((match) => match[1]);
    expect(order).toEqual([
      "x",
      "learn/why",
      "recipes/x",
      "index",
      "rules/a",
      "api/core/readme",
      "api/core/fn",
      "api/react/readme",
    ]);
  });
});
