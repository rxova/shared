import { describe, expect, it } from "vitest";
import { groupPages } from "@/llms/group-pages";
import { fakePage, fakePages } from "@/llms/llms.fixtures";

const sections = [
  ["root", "About"],
  ["learn", "Learn"],
  ["rules", "Rules"],
  ["missing", "Never shown"],
] as const;

describe("groupPages", () => {
  it("orders listed sections editorially and the rest alphabetically under their own key", () => {
    const { groups, optional } = groupPages(fakePages(), { sections });
    expect(groups.map((group) => group.heading)).toEqual([
      "About",
      "Learn",
      "Rules",
      "api:core",
      "api:react",
      "recipes",
    ]);
    expect(optional).toEqual([]);
  });

  it("keeps optional sections apart, ordered by key, dropping no page", () => {
    const pages = fakePages();
    const { groups, optional } = groupPages(pages, {
      sections,
      optional: { match: (section) => section.startsWith("api:") },
    });
    expect(groups.map((group) => group.heading)).toEqual(["About", "Learn", "Rules", "recipes"]);
    expect(optional.map((page) => page.id)).toEqual([
      "api/core/readme",
      "api/core/fn",
      "api/react/readme",
    ]);
    expect(groups.flatMap((group) => group.pages).length + optional.length).toBe(pages.length);
  });

  it("orders optional sections as asked, the rest alphabetically after", () => {
    const { optional } = groupPages(
      [...fakePages(), fakePage("api/devtools/readme", "api:devtools")],
      { optional: { match: (section) => section.startsWith("api:"), order: ["api:react"] } },
    );
    expect(optional.map((page) => page.id)).toEqual([
      "api/react/readme",
      "api/core/readme",
      "api/core/fn",
      "api/devtools/readme",
    ]);
  });

  it("never lists an optional section as prose, even when it is named in sections", () => {
    const { groups } = groupPages(fakePages(), {
      sections: [["api:core", "Core API"]],
      optional: { match: (section) => section === "api:core" },
    });
    expect(groups.map((group) => group.heading)).not.toContain("Core API");
  });

  it("works with no options", () => {
    expect(groupPages([]).groups).toEqual([]);
  });
});
