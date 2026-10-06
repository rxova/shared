import { describe, expect, it } from "vitest";
import { startChangeset } from "@/internal/init/start-changeset";

describe("startChangeset", () => {
  it("bumps the renamed package by a minor, named after the repository", () => {
    expect(
      startChangeset(
        "@repo/hello-world",
        { owner: "rxova", name: "hello-world" },
        { owner: "rxova", name: "template-private" },
      ),
    ).toEqual({
      file: ".changeset/hello-world-start.md",
      body: '---\n"@repo/hello-world": minor\n---\n\nStart hello-world from rxova/template-private.\n',
    });
  });
});
