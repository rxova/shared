import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveAliases } from "@/internal/vitest/resolve-aliases";

describe("resolveAliases", () => {
  it("maps @/ to the package src and nothing else by default", () => {
    expect(resolveAliases("/repo/pkg")).toEqual([
      { find: /^@\//, replacement: `${join("/repo/pkg", "src")}/` },
    ]);
  });

  it("appends a record as string aliases, in order", () => {
    expect(
      resolveAliases("/r", { "@core": "/r/core/src", react: "/r/node_modules/react" }),
    ).toEqual([
      { find: /^@\//, replacement: `${join("/r", "src")}/` },
      { find: "@core", replacement: "/r/core/src" },
      { find: "react", replacement: "/r/node_modules/react" },
    ]);
  });

  it("passes a list through, RegExp finds included", () => {
    const list = [{ find: /^~\//, replacement: "/r/lib/" }];
    expect(resolveAliases("/r", list).slice(1)).toEqual(list);
  });
});
