import { describe, expect, it } from "vitest";
import { globRegExp } from "@/internal/pack-smoke/glob-regexp";

describe("globRegExp", () => {
  it("matches a plain path exactly, dots and all", () => {
    expect(globRegExp("assets/logo.svg").test("assets/logo.svg")).toBe(true);
    expect(globRegExp("assets/logo.svg").test("assets/logoXsvg")).toBe(false);
    expect(globRegExp("assets/logo.svg").test("other/assets/logo.svg")).toBe(false);
  });

  it("drops a leading ./ or / and a trailing /", () => {
    expect(globRegExp("./dist/").test("dist")).toBe(true);
    expect(globRegExp("/llms.txt").test("llms.txt")).toBe(true);
  });

  it("keeps * and ? within one directory", () => {
    expect(globRegExp("dist/*.js").test("dist/index.js")).toBe(true);
    expect(globRegExp("dist/*.js").test("dist/nested/index.js")).toBe(false);
    expect(globRegExp("v?.json").test("v1.json")).toBe(true);
    expect(globRegExp("v?.json").test("v/.json")).toBe(false);
  });

  it("lets ** cross directories, or none", () => {
    expect(globRegExp("dist/**/*.d.ts").test("dist/index.d.ts")).toBe(true);
    expect(globRegExp("dist/**/*.d.ts").test("dist/a/b/index.d.ts")).toBe(true);
    expect(globRegExp("dist/**").test("dist/a/b.js")).toBe(true);
  });

  it("reads {a,b} as either", () => {
    const pattern = globRegExp("dist/*.{js,cjs}");
    expect(pattern.test("dist/index.cjs")).toBe(true);
    expect(pattern.test("dist/index.mjs")).toBe(false);
  });

  it("escapes what regular expressions would read", () => {
    expect(globRegExp("a+b(1)[x]^$|\\.txt").test("a+b(1)[x]^$|\\.txt")).toBe(true);
  });
});
