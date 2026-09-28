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
    expect(scope.reason).toContain("release commit");
  });

  it("runs everything when a manifest changed more than its version", () => {
    const run = fakeGit(["package.json"], { "package.json": `${BUMP}\n+  "private": true,` });
    expect(decideScope("aaa", "bbb", run).codeChanged).toBe(true);
  });

  it("runs everything for a source change", () => {
    const scope = decideScope("aaa", "bbb", fakeGit(["packages/example/src/index.ts"]));
    expect(scope).toEqual({ codeChanged: true, reason: "1 file(s) changed" });
  });
});
