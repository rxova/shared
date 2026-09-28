import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { packageManifests } from "@/internal/packages/package-manifests";

const root = mkdtempSync(join(tmpdir(), "package-manifests-"));
const write = (dir: string, manifest?: object) => {
  mkdirSync(join(root, "packages", dir), { recursive: true });
  if (manifest)
    writeFileSync(join(root, "packages", dir, "package.json"), JSON.stringify(manifest));
};
write("b", { name: "b" });
write("a", { name: "a", private: true });
write("empty");
writeFileSync(join(root, "packages", "notes.md"), "");

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("packageManifests", () => {
  it("lists every package with a manifest, sorted by directory", () => {
    expect(packageManifests(root)).toEqual([
      { dir: "a", manifest: { name: "a", private: true } },
      { dir: "b", manifest: { name: "b" } },
    ]);
  });

  it("keeps only the public ones when asked", () => {
    expect(packageManifests(root, { published: true }).map(({ dir }) => dir)).toEqual(["b"]);
  });

  it("is empty without a packages directory", () => {
    expect(packageManifests(join(root, "packages", "b"))).toEqual([]);
  });
});
