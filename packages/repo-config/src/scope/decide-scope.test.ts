import type { Git } from "@/scope/scope.types";
import { BUMP, fakeGit } from "@/internal/scope/fake-git.fixtures";
import { describe, expect, it } from "vitest";
import { decideScope } from "@/scope/decide-scope";

describe("decideScope", () => {
  it.each([
    [undefined, "bbb"],
    ["aaa", undefined],
    ["0000000000000000000000000000000000000000", "bbb"],
  ])("runs everything without a usable range (%s…%s)", (base, head) => {
    expect(decideScope(base, head, fakeGit([]))).toEqual({
      codeChanged: true,
      docsOnly: false,
      docsChanged: true,
      reason: "no usable commit range",
    });
  });

  it("runs everything when the range cannot be diffed", () => {
    const run: Git = {
      names: () => {
        throw new Error("bad object");
      },
      patch: () => "",
    };
    expect(decideScope("aaa", "bbb", run).reason).toBe("could not diff the range");
  });

  it("runs everything on an empty diff, with the real git by default", () => {
    expect(decideScope("aaa", "bbb", fakeGit([])).reason).toBe("empty diff");
    expect(decideScope("HEAD", "HEAD").reason).toBe("empty diff");
  });

  it("skips a release commit", () => {
    const run = fakeGit(
      [
        ".changeset/tidy-pandas-smile.md",
        "packages/example/CHANGELOG.md",
        "packages/example/package.json",
      ],
      { "packages/example/package.json": BUMP },
    );
    const scope = decideScope("aaa", "bbb", run);
    expect(scope.codeChanged).toBe(false);
    expect(scope.docsOnly).toBe(false);
    expect(scope.docsChanged).toBe(false);
    expect(scope.reason).toContain("release commit");
  });

  it("runs everything when a manifest changed more than its version", () => {
    const run = fakeGit(["package.json"], { "package.json": `${BUMP}\n+  "private": true,` });
    expect(decideScope("aaa", "bbb", run).codeChanged).toBe(true);
  });

  it("runs everything for a source change", () => {
    const scope = decideScope("aaa", "bbb", fakeGit(["packages/example/src/index.ts"]));
    expect(scope).toEqual({
      codeChanged: true,
      docsOnly: false,
      docsChanged: false,
      reason: "1 file(s) changed",
    });
  });

  it("skips a documentation-only range", () => {
    const run = fakeGit(["README.md", "packages/example/README.md", ".changeset/tidy.md"]);
    expect(decideScope("aaa", "bbb", run)).toEqual({
      codeChanged: false,
      docsOnly: true,
      docsChanged: false,
      reason: "documentation only — 3 file(s)",
    });
  });

  it("reports a docs-site change on a documentation-only range", () => {
    const run = fakeGit(["apps/docs/src/content/docs/start/getting-started.md"]);
    const scope = decideScope("aaa", "bbb", run);
    expect(scope.codeChanged).toBe(false);
    expect(scope.docsOnly).toBe(true);
    expect(scope.docsChanged).toBe(true);
  });

  it("reports a docs-site change beside code too", () => {
    const run = fakeGit(["apps/docs/astro.config.mjs"]);
    expect(decideScope("aaa", "bbb", run)).toMatchObject({ codeChanged: true, docsChanged: true });
  });

  it.each([
    [["README.md", "packages/example/src/index.ts"]],
    [["packages/agent-kit/content/skills/example/SKILL.md"]],
    [["packages/example/llms.txt"]],
    [["tests/fixtures/sample.md"]],
  ])("runs everything when %j is not documentation alone", (files) => {
    expect(decideScope("aaa", "bbb", fakeGit(files)).codeChanged).toBe(true);
  });

  it("runs everything when a documentation file was deleted", () => {
    const run = fakeGit(["README.md", "packages/example/README.md"], {}, [
      "packages/example/README.md",
    ]);
    expect(decideScope("aaa", "bbb", run)).toMatchObject({ codeChanged: true, docsOnly: false });
  });

  it("runs everything when deletions cannot be told apart", () => {
    const run: Git = { names: () => ["README.md"], patch: () => "" };
    expect(decideScope("aaa", "bbb", run).codeChanged).toBe(true);
  });

  it("follows the repository's rules", () => {
    const run = fakeGit(["docs/guide.txt", "site/page.md"]);
    const rules = { ignore: ["docs/**", "site/**"], keep: [], site: ["site/**"] };
    expect(decideScope("aaa", "bbb", run, rules)).toMatchObject({
      codeChanged: false,
      docsOnly: true,
      docsChanged: true,
    });
    expect(decideScope("aaa", "bbb", fakeGit(["README.md"]), { ignore: [] }).codeChanged).toBe(
      true,
    );
  });
});
