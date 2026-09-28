import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { checkSnippetsCommand } from "@/docs/check-snippets-command";

const made: string[] = [];
const repo = (files: Record<string, string>, snippets?: object) => {
  const root = mkdtempSync(join(tmpdir(), "check-snippets-"));
  made.push(root);
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ repoConfig: snippets && { snippets } }),
  );
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
  }
  return root;
};

afterAll(() => {
  for (const dir of made) rmSync(dir, { recursive: true, force: true });
});

const fence = (info: string, code: string) => `\`\`\`${info}\n${code}\n\`\`\`\n`;

describe("checkSnippetsCommand", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  it("passes snippets that parse, and skips live fences", () => {
    const root = repo({
      "README.md": fence("ts", "const a = 1;"),
      "packages/a/llms.txt": `# a\n\n${fence("tsx live", "<A />; <B")}`,
    });
    expect(checkSnippetsCommand({ root })).toBe(0);
    expect(log).toHaveBeenCalledWith("check-snippets: 1 snippet(s) in 2 file(s) parse");
  });

  it("fails a snippet that does not parse, with file and line", () => {
    const root = repo({ "packages/a/README.md": `# a\n\n${fence("ts", "const = ;")}` });
    expect(checkSnippetsCommand({ root })).toBe(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("  packages/a/README.md:3 does not parse"),
    );
  });

  it("reads the files and skip words from the config", () => {
    const root = repo(
      { "docs/a.md": fence("ts skip", "const = ;"), "README.md": fence("ts", "const = ;") },
      { include: ["docs"], skipInfo: ["skip"] },
    );
    expect(checkSnippetsCommand({ root })).toBe(0);
  });

  it("reads the working directory by default, and reports a bad config", () => {
    const cwd = vi.spyOn(process, "cwd").mockReturnValue(repo({}));
    expect(checkSnippetsCommand()).toBe(0);
    cwd.mockRestore();
    expect(checkSnippetsCommand({ root: repo({}, { include: "README.md" }) })).toBe(1);
  });
});
