import { describe, expect, it } from "vitest";
import { repositoryOf } from "@/internal/init/repository-of";

describe("repositoryOf", () => {
  it.each([
    [{ type: "git", url: "git+https://github.com/rxova/template-oss.git" }],
    ["https://github.com/rxova/template-oss"],
    ["git@github.com:rxova/template-oss.git"],
    ["github:rxova/template-oss"],
    ["rxova/template-oss"],
  ])("reads %j", (repository) => {
    expect(repositoryOf(repository)).toEqual({ owner: "rxova", name: "template-oss" });
  });

  it.each([[undefined], [{}], [{ url: "https://gitlab.com/a" }], [""]])(
    "refuses %j",
    (repository) => {
      expect(() => repositoryOf(repository)).toThrow(/does not name a GitHub repository/);
    },
  );

  it("reads a long run of hosts in linear time", () => {
    const started = Date.now();

    expect(() => repositoryOf("github.com:".repeat(20_000))).toThrow(
      /does not name a GitHub repository/,
    );
    expect(Date.now() - started).toBeLessThan(500);
  });
});
