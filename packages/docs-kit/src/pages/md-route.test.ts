import { describe, expect, it } from "vitest";
import { mdRoute } from "@/pages/md-route";

describe("mdRoute", () => {
  it("twins the home page at /index.md", () => {
    expect(mdRoute("index")).toBe("/index.md");
    expect(mdRoute("")).toBe("/index.md");
  });

  it("appends .md to every other id", () => {
    expect(mdRoute("rules/test-removed")).toBe("/rules/test-removed.md");
  });
});
