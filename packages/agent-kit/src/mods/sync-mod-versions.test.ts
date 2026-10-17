import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { modManifests, syncModVersions } from "@/mods/sync-mod-versions";

const packageDir = join(import.meta.dirname, "..", "..");
const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A package at `version` with one mod per entry of `mods`, each manifest written as given. */
const fakePackage = (version: string | undefined, mods: Record<string, string>): string => {
  const dir = mkdtempSync(join(tmpdir(), "rx-ai-mods-"));
  dirs.push(dir);
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "kit", version }));
  for (const [name, manifest] of Object.entries(mods)) {
    mkdirSync(join(dir, "mods", name, ".claude-plugin"), { recursive: true });
    writeFileSync(join(dir, "mods", name, ".claude-plugin", "plugin.json"), manifest);
  }
  writeFileSync(join(dir, "mods", "README.md"), "not a mod");
  return dir;
};

const manifest = (dir: string, name: string): string =>
  readFileSync(join(dir, "mods", name, ".claude-plugin", "plugin.json"), "utf8");

describe("syncModVersions", () => {
  it("gives every mod the package's version and rewrites nothing else", () => {
    const dir = fakePackage("0.5.0", {
      b: '{\n  "name": "b",\n  "version": "0.1.0",\n  "author": { "name": "J" }\n}\n',
      a: '{ "name": "a", "version" : "0.4.1" }',
    });

    expect(syncModVersions(dir)).toEqual([
      join(dir, "mods", "a", ".claude-plugin", "plugin.json"),
      join(dir, "mods", "b", ".claude-plugin", "plugin.json"),
    ]);
    expect(manifest(dir, "a")).toBe('{ "name": "a", "version" : "0.5.0" }');
    expect(manifest(dir, "b")).toBe(
      '{\n  "name": "b",\n  "version": "0.5.0",\n  "author": { "name": "J" }\n}\n',
    );
  });

  it("leaves a mod already at the version alone", () => {
    const dir = fakePackage("0.5.0", { a: '{"version":"0.5.0"}' });

    expect(syncModVersions(dir)).toEqual([]);
    expect(manifest(dir, "a")).toBe('{"version":"0.5.0"}');
  });

  it("refuses a package or a mod with no version", () => {
    expect(() => syncModVersions(fakePackage(undefined, { a: '{"version":"0.1.0"}' }))).toThrow(
      "has no version",
    );
    expect(() => syncModVersions(fakePackage("0.5.0", { a: '{"name":"a"}' }))).toThrow(
      "plugin.json has no version",
    );
  });
});

describe("the kit's own mods", () => {
  it("carry the package's version, so claude plugin update sees each release", () => {
    const { version } = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as {
      version: string;
    };
    const versions = modManifests(packageDir).map(
      (path) => (JSON.parse(readFileSync(path, "utf8")) as { version?: string }).version,
    );

    expect(versions.length).toBeGreaterThan(0);
    expect(versions).toEqual(versions.map(() => version));
  });
});
