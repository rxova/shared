import { describe, expect, it } from "vitest";
import { DEFAULT_SCOPE_RULES } from "@/internal/scope/default-scope-rules";
import { isDocsFile } from "@/internal/scope/is-docs-file";

describe("isDocsFile", () => {
  it.each([
    "README.md",
    "CONTRIBUTING.md",
    ".github/pull_request_template.md",
    "packages/example/README.md",
    "apps/docs/src/content/docs/start/getting-started.md",
    "apps/docs/src/content/docs/index.mdx",
  ])("treats %s as documentation by default", (file) => {
    expect(isDocsFile(file, DEFAULT_SCOPE_RULES)).toBe(true);
  });

  it.each([
    "packages/agent-kit/content/skills/example/SKILL.md",
    "packages/example/src/template.md",
    "tests/fixtures/sample.md",
    "src/__tests__/snapshot.md",
    "packages/example/llms.txt",
    "packages/example/src/index.ts",
    "package.json",
  ])("treats %s as code by default", (file) => {
    expect(isDocsFile(file, DEFAULT_SCOPE_RULES)).toBe(false);
  });

  it("follows the repository's own globs", () => {
    const rules = { ignore: ["docs/**", "**/*.md"], keep: ["docs/generated/**"] };
    expect(isDocsFile("docs/guide.txt", rules)).toBe(true);
    expect(isDocsFile("docs/generated/api.md", rules)).toBe(false);
  });
});
