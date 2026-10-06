import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { readFile } from "@/internal/config/read-file";
import { workspaceVersions } from "@/internal/changeset/workspace-versions";

const root = mkdtempSync(join(tmpdir(), "workspace-versions-"));
const write = (dir: string, manifest?: object) => {
  mkdirSync(join(root, dir), { recursive: true });
  if (manifest) writeFileSync(join(root, dir, "package.json"), JSON.stringify(manifest));
};
write("packages/empty");
write("packages/core", { name: "@rxova/core", version: "1.2.3" });
write("packages/unversioned", { name: "unversioned" });
write("packages/unnamed", { version: "1.0.0" });
write("apps/site", { name: "site", version: "0.1.0", private: true });
write("tools/cli", { name: "cli", version: "3.0.0" });

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("workspaceVersions", () => {
  it("reads every named, versioned package under packages and apps, private ones too", () => {
    expect(workspaceVersions(root, readFile)).toEqual({ "@rxova/core": "1.2.3", site: "0.1.0" });
  });

  it("reads the roots it is given, and skips one that does not exist", () => {
    expect(workspaceVersions(root, readFile, ["tools", "missing"])).toEqual({ cli: "3.0.0" });
  });
});
