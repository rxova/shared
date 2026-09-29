import { describe, expect, it } from "vitest";
import { fakePage, fakePages } from "@/llms/llms.fixtures";
import { llmsIndex } from "@/llms/llms-index";

const base = {
  project: "overlock",
  summary: ["Reads a patch.", "Reports weakened tests."],
  mount: "https://rxova.dev/packages/overlock/",
  sections: [
    ["root", "About"],
    ["learn", "Learn"],
  ] as const,
};

describe("llmsIndex", () => {
  it("writes the header, the preamble and one section per group", () => {
    const text = llmsIndex([fakePage("index", "root"), fakePage("learn/why", "learn")], {
      ...base,
      preamble: ["## Run it", "", "    npx overlock"],
    });
    expect(text).toBe(
      [
        "# overlock",
        "",
        "> Reads a patch.",
        "> Reports weakened tests.",
        "",
        "Every link below is raw markdown. The human page is the same URL without the",
        "`.md` suffix.",
        "",
        "Everything inlined in one fetch: https://rxova.dev/packages/overlock/llms-full.txt",
        "",
        "## Run it",
        "",
        "    npx overlock",
        "",
        "## About",
        "",
        "- [index](https://rxova.dev/index.md): About index",
        "",
        "## Learn",
        "",
        "- [learn/why](https://rxova.dev/learn/why.md): About learn/why",
        "",
      ].join("\n"),
    );
  });

  it("does not double the blank line after a preamble that ends in one", () => {
    const text = llmsIndex([fakePage("index", "root")], { ...base, preamble: ["Note.", ""] });
    expect(text).toContain("Note.\n\n## About");
  });

  it("omits the colon for a page with no description", () => {
    expect(llmsIndex(fakePages(), base)).toContain("- [rules/a](https://rxova.dev/rules/a.md)\n");
  });

  it("lists optional pages last, one link each by default", () => {
    const text = llmsIndex(fakePages(), {
      ...base,
      optional: { match: (s) => s.startsWith("api:") },
    });
    expect(
      text.endsWith(
        [
          "## Optional",
          "",
          "- [api/core/readme](https://rxova.dev/api/core/readme.md)",
          "- [api/core/fn](https://rxova.dev/api/core/fn.md)",
          "- [api/react/readme](https://rxova.dev/api/react/readme.md)",
          "",
        ].join("\n"),
      ),
    ).toBe(true);
  });

  it("takes an intro and collapsed links for the optional pages", () => {
    const text = llmsIndex(fakePages(), {
      ...base,
      optional: {
        match: (s) => s.startsWith("api:"),
        intro: ["Generated reference."],
        links: (pages) => [`- ${String(pages.length)} API pages`],
      },
    });
    expect(text.endsWith("## Optional\n\nGenerated reference.\n\n- 3 API pages\n")).toBe(true);
  });
});
