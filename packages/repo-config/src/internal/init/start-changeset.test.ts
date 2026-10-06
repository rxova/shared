import { describe, expect, it } from "vitest";
import { startChangeset } from "@/internal/init/start-changeset";

describe("startChangeset", () => {
  it("bumps the renamed package by a minor, named after the repository", () => {
    expect(
      startChangeset(
        "@acme/app",
        { owner: "acme", name: "app" },
        { owner: "acme", name: "template" },
      ),
    ).toEqual({
      file: ".changeset/app-start.md",
      body: '---\n"@acme/app": minor\n---\n\nStart app from acme/template.\n',
    });
  });
});
