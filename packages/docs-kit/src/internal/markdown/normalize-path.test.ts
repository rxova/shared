import { describe, expect, it } from "vitest";
import { normalizePath } from "@/internal/markdown/normalize-path";

describe("normalizePath", () => {
  it.each([
    ["/learn/../rules/x.md", "/rules/x.md"],
    ["/a/./b//c", "/a/b/c"],
    ["/../../x", "/x"],
    ["/", "/"],
  ])("%s is %s", (path, expected) => {
    expect(normalizePath(path)).toBe(expected);
  });
});
