import type { Git } from "@/scope/scope.types";
import { describe, expect, it } from "vitest";
import { fakeGit } from "@/internal/scope/fake-git.fixtures";
import { deletedPaths } from "@/internal/scope/deleted-paths";

const RANGE = { base: "aaa", head: "bbb" };

describe("deletedPaths", () => {
  it("lists what the range deleted", () => {
    expect(deletedPaths(RANGE, fakeGit([], {}, ["README.md"]))).toEqual(new Set(["README.md"]));
  });

  it("cannot tell without a way to ask", () => {
    expect(deletedPaths(RANGE, { names: () => [], patch: () => "" })).toBeUndefined();
  });

  it("cannot tell when git fails", () => {
    const run: Git = {
      names: () => [],
      patch: () => "",
      deleted: () => {
        throw new Error("bad object");
      },
    };
    expect(deletedPaths(RANGE, run)).toBeUndefined();
  });
});
