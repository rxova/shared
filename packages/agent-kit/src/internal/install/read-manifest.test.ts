import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { writeTree } from "@/internal/install/install.fixtures";
import { readManifest } from "@/internal/install/read-manifest";

const target = mkdtempSync(join(tmpdir(), "rx-ai-manifest-"));
afterAll(() => {
  rmSync(target, { recursive: true, force: true });
});

describe("readManifest", () => {
  it("is undefined with no file, or one without a version and a file list", () => {
    expect(readManifest(target)).toBeUndefined();
    writeTree(target, { "rx-ai/manifest.json": '{"version":1,"files":[]}' });
    expect(readManifest(target)).toBeUndefined();
    writeTree(target, { "rx-ai/manifest.json": "[]" });
    expect(readManifest(target)).toBeUndefined();
  });

  it("keeps only the string entries of the lists", () => {
    writeTree(target, {
      "rx-ai/manifest.json":
        '{"version":"1.0.0","profile":"full","items":["x",1],"files":["a",2,"b"]}',
    });
    expect(readManifest(target)).toEqual({
      version: "1.0.0",
      profile: "full",
      items: ["x"],
      files: ["a", "b"],
      createdSettings: false,
    });
  });

  it("reads a manifest from before profiles as core with no items", () => {
    writeTree(target, { "rx-ai/manifest.json": '{"version":"0.1.0","files":["a"]}' });
    expect(readManifest(target)).toEqual({
      version: "0.1.0",
      profile: "core",
      items: [],
      files: ["a"],
      createdSettings: false,
    });
  });
});
