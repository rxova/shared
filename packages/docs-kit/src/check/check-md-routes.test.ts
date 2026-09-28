import { describe, expect, it } from "vitest";
import { fakeDist, fakeHtml, fakeTwin, PREFIX } from "@/check/check.fixtures";
import { checkMdRoutes } from "@/check/check-md-routes";

describe("checkMdRoutes", () => {
  it("passes a well-formed build", async () => {
    const dir = await fakeDist({
      "index.html": fakeHtml(),
      "index.md": fakeTwin("index"),
      "rules/test-removed/index.html": fakeHtml(),
      "rules/test-removed.md": fakeTwin("rules/test-removed"),
      "404.html": fakeHtml("404"),
      "llms.txt": "small",
      "llms-full.txt": "small",
    });
    expect(await checkMdRoutes(dir)).toEqual({ failures: [], pages: 3, twins: 2 });
  });

  it("reports a page with no twin", async () => {
    const dir = await fakeDist({
      "index.md": fakeTwin("index"),
      "rules/test-removed/index.html": fakeHtml(),
      "reference/cli.md": fakeTwin("reference/cli"),
      "reference/cli/index.html": fakeHtml(),
    });
    expect((await checkMdRoutes(dir)).failures).toEqual([
      "rules/test-removed/index.html has no markdown twin at rules/test-removed.md",
    ]);
  });

  it("skips untwinned pages, by path or directory, and redirect stubs", async () => {
    const dir = await fakeDist({
      "index.html": fakeHtml(),
      "playground/app/index.html": fakeHtml(),
      "old/index.html": '<meta http-equiv="refresh" content="0;url=/new/">',
      "reference/cli/index.html": fakeHtml(),
      "reference/cli.md": fakeTwin("reference/cli"),
    });
    expect(
      (await checkMdRoutes(dir, { untwinned: ["index.html", "playground/"] })).failures,
    ).toEqual([]);
  });

  it("reports unhandled markup, and only outside a fence", async () => {
    const dir = await fakeDist({
      "reference/cli.md": fakeTwin("reference/cli", '<TabItem label="npm">'),
      "reference/suppressions.md": fakeTwin(
        "reference/suppressions",
        ["```md", '<TabItem label="npm">', "see [x](/reference/cli/)", "```"].join("\n"),
      ),
    });
    const { failures } = await checkMdRoutes(dir);
    expect(failures).toEqual([
      'reference/cli.md contains an unhandled Starlight/MDX component: "<TabItem"',
    ]);
  });

  it("forbids the extra components, patterns and fence infos a site names", async () => {
    const dir = await fakeDist({
      "a/x.md": fakeTwin(
        "a/x",
        ['<LiveExample code="x" />', "TODO", "```tsx live", "y", "```"].join("\n"),
      ),
    });
    const { failures } = await checkMdRoutes(dir, {
      components: { unwrap: ["LiveExample"] },
      forbidden: [[/\bTODO\b/, "a TODO"]],
      forbiddenInfo: [[/\s+live\b/, "a live fence meta"]],
    });
    expect(failures).toEqual([
      'a/x.md contains an unhandled Starlight/MDX component: "<LiveExample"',
      'a/x.md contains a TODO: "TODO"',
      'a/x.md contains a live fence meta: " live"',
    ]);
  });

  it("reports a link to a twin that does not exist, and accepts one that does", async () => {
    const dir = await fakeDist({
      "learn/severity.md": fakeTwin(
        "learn/severity",
        `[cli](${PREFIX}/reference/cli.md) [ok](${PREFIX}/learn/other.md#x)`,
      ),
      "learn/other.md": fakeTwin("learn/other"),
    });
    expect((await checkMdRoutes(dir)).failures).toEqual([
      "learn/severity.md links to reference/cli.md, which is not a twin",
    ]);
  });

  it("reports twins it cannot pin a site prefix from", async () => {
    const dir = await fakeDist({
      "index.md": fakeTwin("index"),
      "reference/cli.md": "# No frontmatter here.\n",
      "reference/other.md": "---\nsource: https://elsewhere.org/nope/\n---\n",
    });
    expect((await checkMdRoutes(dir)).failures).toEqual([
      'could not determine the site prefix from any twin\'s "source:" frontmatter',
    ]);
  });

  it("reports llms-full.txt and llms.txt over budget", async () => {
    const dir = await fakeDist({
      "reference/cli.md": fakeTwin("reference/cli"),
      "llms-full.txt": "x".repeat(801 * 1024),
      "llms.txt": "x".repeat(3 * 1024),
    });
    const { failures } = await checkMdRoutes(dir, { maxIndexBytes: 2 * 1024 });
    expect(failures).toEqual([
      "llms-full.txt is 801 kB, over the 800 kB budget — split it or raise the budget deliberately",
      "llms.txt is 3 kB, over the 2 kB budget — it is an index — collapse a section rather than raising this",
    ]);
  });

  it("says nothing about an empty dist", async () => {
    expect(await checkMdRoutes(await fakeDist({}))).toEqual({ failures: [], pages: 0, twins: 0 });
  });
});
