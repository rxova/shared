import { afterEach, describe, expect, it, vi } from "vitest";
import { logGroup } from "@/internal/verify/log-group";

describe("logGroup", () => {
  const out = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  afterEach(() => {
    out.mockClear();
  });

  it("prints a plain heading and returns what the work returned", () => {
    expect(logGroup("lint", false, () => 3)).toBe(3);
    expect(out.mock.calls).toEqual([["\nlint\n"]]);
  });

  it("folds the work into a GitHub log group, closed even when it throws", () => {
    expect(() =>
      logGroup("lint", true, () => {
        throw new Error("x");
      }),
    ).toThrow("x");
    expect(out.mock.calls).toEqual([["::group::lint\n"], ["::endgroup::\n"]]);
  });
});
