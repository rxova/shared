import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface PackageSpec {
  name: string;
  private?: boolean;
  files?: string[];
  llms?: string | undefined;
  index?: string | undefined;
}

const made: string[] = [];

/** Removes every repository `llmsRepo` made. Register it with `afterEach`. */
export const cleanupLlmsRepos = (): void => {
  for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true });
};

/** A throwaway repository root with `packages/<dir>` for each spec. */
export const llmsRepo = (specs: Record<string, PackageSpec>, rootIndex?: string): string => {
  const root = mkdtempSync(join(tmpdir(), "check-llms-"));
  made.push(root);

  for (const [dir, spec] of Object.entries(specs)) {
    const pkgDir = join(root, "packages", dir);
    mkdirSync(join(pkgDir, "src"), { recursive: true });
    const manifest = {
      name: spec.name,
      private: spec.private,
      files: spec.files ?? ["dist", "llms.txt"],
    };
    writeFileSync(join(pkgDir, "package.json"), JSON.stringify(manifest));
    if (spec.llms !== undefined) writeFileSync(join(pkgDir, "llms.txt"), spec.llms);
    if (spec.index !== undefined) writeFileSync(join(pkgDir, "src", "index.ts"), spec.index);
  }
  if (rootIndex !== undefined) writeFileSync(join(root, "llms.txt"), rootIndex);
  return root;
};

export const apiTable = (...names: string[]): string =>
  [
    "## API",
    "",
    "| Export | Kind |",
    "| --- | --- |",
    ...names.map((n) => `| \`${n}\` | x |`),
    "",
  ].join("\n");

export const wellFormed = (name: string, api = apiTable("toError")): string =>
  [
    `# ${name}`,
    "",
    "> A summary.",
    "",
    "## Install",
    "",
    `    npm i ${name}`,
    "",
    api,
    "## Docs",
    "",
  ].join("\n");

export const INDEX = "export { toError } from './toError'\n";
export const PKG = { dir: "lib", name: "lib", files: ["dist", "llms.txt"] };
