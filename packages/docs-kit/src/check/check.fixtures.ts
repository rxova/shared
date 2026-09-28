import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/** Writes a throwaway dist tree, `{ 'a/index.html': '…' }`, and returns its directory. */
export const fakeDist = async (files: Record<string, string>): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), "rx-docs-kit-"));
  for (const [path, body] of Object.entries(files)) {
    const full = join(dir, path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, body);
  }
  return dir;
};

export const PREFIX = "https://rxova.org/packages/overlock";

/** A twin whose `source:` frontmatter pins the site prefix the check reads back. */
export const fakeTwin = (route: string, body = "Body."): string =>
  ["---", `title: "${route}"`, `source: ${PREFIX}/${route}/`, "---", "", body, ""].join("\n");

/** A built HTML page. */
export const fakeHtml = (title = "Page"): string =>
  `<!doctype html><title>${title}</title><p>Hi.</p>`;
