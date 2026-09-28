import { describe, expect, it } from "vitest";
import { forbiddenMarkup } from "@/internal/check/forbidden-markup";

describe("forbiddenMarkup", () => {
  it("is made of real patterns, none of which match an empty string", () => {
    for (const [pattern, why] of forbiddenMarkup(["Tabs", "TabItem"])) {
      expect(pattern.test(""), why).toBe(false);
    }
  });

  it.each([
    ['<TabItem label="npm">', "component"],
    ["import { x } from '@astrojs/starlight/components';", "MDX import"],
    ["[a](/rules/)", "root-relative link"],
    ["[a](../x.md)", "doc-relative link"],
    ['<img src="/a.png">', "root-relative HTML attribute"],
    ["{import.meta.env.BASE_URL}", "BASE_URL"],
  ])("catches %s", (text, meaning) => {
    const hit = forbiddenMarkup(["Tabs", "TabItem"]).find(([pattern]) => pattern.test(text));
    expect(hit?.[1]).toContain(meaning);
  });

  it("lets through what a twin should contain", () => {
    const text = '[a](https://x.org/a.md) <img src="//cdn/x"> <Custom /> imports matter.';
    expect(forbiddenMarkup(["Tabs"]).filter(([pattern]) => pattern.test(text))).toEqual([]);
  });
});
