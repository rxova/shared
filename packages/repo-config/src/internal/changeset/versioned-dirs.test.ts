import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { versionedDirs } from "@/internal/changeset/versioned-dirs";

const repo = () => {
  const root = mkdtempSync(join(tmpdir(), "versioned-dirs-"));
  mkdirSync(join(root, "packages", "internal"), { recursive: true });
  mkdirSync(join(root, "packages", "lib"));
  mkdirSync(join(root, "packages", "empty"));
  writeFileSync(join(root, "packages", "internal", "package.json"), '{"private":true}');
  writeFileSync(join(root, "packages", "lib", "package.json"), "{}");
  return root;
};

describe("versionedDirs", () => {
  it("is the published packages without includePrivate", () => {
    const root = repo();
    try {
      expect(versionedDirs(root, false)).toEqual(["lib"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("counts every package with a manifest with includePrivate", () => {
    const root = repo();
    try {
      expect(versionedDirs(root, true).sort()).toEqual(["internal", "lib"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("is empty without a packages directory", () => {
    const root = mkdtempSync(join(tmpdir(), "versioned-dirs-"));
    try {
      expect(versionedDirs(root, true)).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
