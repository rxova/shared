import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isEntry } from "@/internal/entry/is-entry";
import { readJson } from "@/internal/install/read-json";

const VERSION = /("version"\s*:\s*)"[^"]*"/;

const versionOf = (path: string): unknown => {
  const manifest = readJson(path);
  return typeof manifest === "object" && manifest !== null && "version" in manifest
    ? manifest.version
    : undefined;
};

/** The `.claude-plugin/plugin.json` of every Claude Code mod under the package's `mods/`. */
export const modManifests = (packageDir: string): string[] =>
  readdirSync(join(packageDir, "mods"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(packageDir, "mods", entry.name, ".claude-plugin", "plugin.json"))
    .sort();

/**
 * Gives every mod the package's own version, so a release that changes a mod reaches
 * `claude plugin update`: Claude Code keys its installed copy by the manifest's version and keeps
 * that copy while the version stays the same. Only the version is rewritten, the rest of each file
 * as it was. Returns the manifests it changed.
 */
export const syncModVersions = (packageDir: string): string[] => {
  const version = versionOf(join(packageDir, "package.json"));
  if (typeof version !== "string") throw new Error(`${packageDir}/package.json has no version`);
  return modManifests(packageDir).filter((path) => {
    if (versionOf(path) === version) return false;
    const text = readFileSync(path, "utf8");
    if (!VERSION.test(text)) throw new Error(`${path} has no version`);
    writeFileSync(path, text.replace(VERSION, `$1"${version}"`));
    return true;
  });
};

/* v8 ignore start -- the process shell around `syncModVersions`; its test spawns it. */
if (isEntry(import.meta.url)) {
  const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  for (const path of syncModVersions(packageDir)) process.stdout.write(`${path}\n`);
}
/* v8 ignore stop */
