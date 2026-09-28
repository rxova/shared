import { SKIP_LABEL } from "@/internal/changeset/skip-label";
import { describe, expect, it } from "vitest";
import { checkChangeset } from "@/changeset/check-changeset";

const PUBLISHED = ["example"];

describe("checkChangeset", () => {
  it("requires nothing when nothing publishable changed", () => {
    const verdict = checkChangeset(["packages/repo-config/src/cli.ts"], PUBLISHED);
    expect(verdict.exitCode).toBe(0);
    expect(verdict.message).toContain("no publishable change");
  });

  it("is satisfied by a changeset alongside the change", () => {
    const verdict = checkChangeset(
      ["packages/example/src/index.ts", ".changeset/tidy-pandas-smile.md"],
      PUBLISHED,
    );
    expect(verdict.exitCode).toBe(0);
    expect(verdict.message).toContain("changeset present");
  });

  it("fails a publishable change with no changeset, and says what to do", () => {
    const verdict = checkChangeset(["packages/example/src/index.ts"], PUBLISHED);
    expect(verdict.exitCode).toBe(1);
    expect(verdict.message).toContain("adds no changeset");
    expect(verdict.message).toContain("pnpm changeset");
    expect(verdict.message).toContain(SKIP_LABEL);
  });

  it("asks for nothing when the pull request carries the label", () => {
    const verdict = checkChangeset(["packages/example/package.json"], PUBLISHED, {
      labels: ["dependencies", SKIP_LABEL],
    });
    expect(verdict.exitCode).toBe(0);
    expect(verdict.message).toContain(SKIP_LABEL);
  });

  it("asks for nothing when the title carries the marker", () => {
    const verdict = checkChangeset(["packages/example/package.json"], PUBLISHED, {
      title: `chore: bump [${SKIP_LABEL}]`,
    });
    expect(verdict.exitCode).toBe(0);
    expect(verdict.message).toContain("title");
  });

  it("is not satisfied by some other label, or the bare word in the title", () => {
    const changed = ["packages/example/src/index.ts"];
    expect(checkChangeset(changed, PUBLISHED, { labels: ["dependencies"] }).exitCode).toBe(1);
    expect(checkChangeset(changed, PUBLISHED, { title: SKIP_LABEL }).exitCode).toBe(1);
  });

  it("does not count a changeset the pull request deletes", () => {
    const changed = ["packages/example/src/index.ts", ".changeset/old.md"];
    const present = ["packages/example/src/index.ts"];
    expect(checkChangeset(changed, PUBLISHED, {}, { present }).exitCode).toBe(1);
  });

  it('decides on the shipped paths when they are given, and lists them', () => {
    const changed = ['packages/example/README.md'];
    expect(checkChangeset(changed, PUBLISHED, {}, { shipped: [] }).exitCode).toBe(0);
    const verdict = checkChangeset(changed, PUBLISHED, {}, { shipped: changed });
    expect(verdict.exitCode).toBe(1);
    expect(verdict.message).toContain('  packages/example/README.md');
  });
});
