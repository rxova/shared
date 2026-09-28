import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { declaredExports } from "@/internal/llms/declared-exports";
import { documentedExports } from "@/internal/llms/documented-exports";
import { LLMS_FILE } from "@/internal/llms/llms-file";
import type { Failure, PublishedPackage } from "@/internal/llms/llms.types";

/** Every way one package's `llms.txt` can be missing, unshipped, malformed or stale. */
export const checkLlmsPackage = (root: string, pkg: PublishedPackage): Failure[] => {
  const pkgDir = join(root, "packages", pkg.dir);
  const path = join(pkgDir, LLMS_FILE);
  if (!existsSync(path)) {
    return [{ where: pkg.name, reason: `has no ${LLMS_FILE}; every published package ships one` }];
  }

  const failures: Failure[] = [];
  const fail = (reason: string) => {
    failures.push({ where: pkg.name, reason });
  };

  if (!pkg.files.includes(LLMS_FILE)) {
    fail(`does not list ${LLMS_FILE} in \`files\`, so the tarball leaves it out`);
  }

  const body = readFileSync(path, "utf8");
  const lines = body.split("\n");
  const title = body.split("\n", 1).join("");

  // The title is the package name, so a file copied from a sibling is caught.
  if (title !== `# ${pkg.name}`) {
    fail(`${LLMS_FILE} must open with "# ${pkg.name}", found ${JSON.stringify(title)}`);
  }
  // llmstxt.org: a blockquote summary directly under the title.
  if (!lines.slice(1, 4).some((line) => line.startsWith("> "))) {
    fail(`${LLMS_FILE} needs a "> " summary under the title`);
  }
  for (const heading of ["## Install", "## API", "## Docs"]) {
    if (!lines.includes(heading)) fail(`${LLMS_FILE} has no "${heading}" section`);
  }

  const entry = join(pkgDir, "src", "index.ts");
  if (!existsSync(entry)) {
    fail(`has no src/index.ts to check the ${LLMS_FILE} API table against`);
    return failures;
  }

  const documented = new Set(documentedExports(body));
  const declared = declaredExports(entry);
  for (const name of documented) {
    if (!declared.has(name))
      fail(`${LLMS_FILE} documents \`${name}\`, which src/index.ts does not export`);
  }
  for (const name of declared) {
    if (!documented.has(name))
      fail(`${LLMS_FILE} does not document \`${name}\`, which src/index.ts exports`);
  }

  return failures;
};
