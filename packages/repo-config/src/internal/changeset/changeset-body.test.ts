import { describe, expect, it } from "vitest";
import { changesetBody } from "@/internal/changeset/changeset-body";
import { packagesNamed } from "@/internal/changeset/packages-named";

describe("changesetBody", () => {
  it("writes frontmatter naming one package, then the summary", () => {
    const body = changesetBody("@rxova/core", "minor", " Add a thing. ");
    expect(body).toBe('---\n"@rxova/core": minor\n---\n\nAdd a thing.\n');
    expect(packagesNamed(body)).toBe(1);
  });
});
