import { describe, expect, it } from "vitest";
import type { DocsEntry } from "@/pages/docs-pages.types";
import { docsPages } from "@/pages/docs-pages";

const entry = (id: string, data: Partial<DocsEntry["data"]> = {}, body?: string): DocsEntry => ({
  id,
  ...(body === undefined ? {} : { body }),
  data: { title: id, ...data },
});

const options = { origin: "https://rxova.dev", base: "/packages/x/" };

describe("docsPages", () => {
  it("normalizes each entry, with absolute URLs and a base-relative twin route", () => {
    const [page] = docsPages(
      [entry("learn/intro", { title: "Intro" }, "Read [this](../rules/a.md) first, then go.")],
      options,
    );
    expect(page).toEqual({
      id: "learn/intro",
      title: "Intro",
      description: "Read this first, then go.",
      section: "learn",
      mdRoute: "/learn/intro.md",
      htmlUrl: "https://rxova.dev/packages/x/learn/intro/",
      mdUrl: "https://rxova.dev/packages/x/learn/intro.md",
      body: "Read [this](https://rxova.dev/packages/x/rules/a.md) first, then go.",
    });
  });

  it("prefers the frontmatter description, and names the home page index", () => {
    const [home] = docsPages([entry("", { description: "Home." }, "Body.")], { origin: "o" });
    expect(home).toMatchObject({ id: "index", description: "Home.", mdRoute: "/index.md" });
    expect(home?.htmlUrl).toBe("o/");
  });

  it("leaves out splash pages by default, and sorts by id", () => {
    const pages = docsPages(
      [entry("b"), entry("landing", { template: "splash" }), entry("a"), entry("c/d")],
      options,
    );
    expect(pages.map((page) => page.id)).toEqual(["a", "b", "c/d"]);
  });

  it("takes its own exclusions, by predicate, id list or pattern", () => {
    const entries = [entry("a"), entry("api/x"), entry("playground/y"), entry("z")];
    expect(docsPages(entries, { ...options, excludeIds: /^api\// }).map((p) => p.id)).toEqual([
      "a",
      "playground/y",
      "z",
    ]);
    expect(
      docsPages(entries, {
        ...options,
        excludeIds: ["z"],
        exclude: (e) => e.id.startsWith("p"),
      }).map((p) => p.id),
    ).toEqual(["a", "api/x"]);
  });

  it("takes its own sections and markdown rules", () => {
    const [page] = docsPages(
      [entry("api/core/x", {}, "<Live />\n\nA body long enough to count.")],
      {
        ...options,
        sectionOf: (id) => (id.startsWith("api/") ? `api:${id.split("/")[1] ?? ""}` : "root"),
        markdown: { components: { unwrap: ["Live"] } },
      },
    );
    expect(page?.section).toBe("api:core");
    expect(page?.body).toBe("A body long enough to count.");
  });
});
