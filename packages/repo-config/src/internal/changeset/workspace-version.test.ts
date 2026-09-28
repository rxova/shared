import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { readFile } from "@/internal/config/read-file";
import { workspaceVersion } from "@/internal/changeset/workspace-version";

const root = mkdtempSync(join(tmpdir(), "workspace-version-"));
const write = (dir: string, manifest?: object) => {
  mkdirSync(join(root, dir), { recursive: true });
  if (manifest) writeFileSync(join(root, dir, "package.json"), JSON.stringify(manifest));
};
write("packages/empty");
write("packages/core", { name: "@rxova/core", version: "1.2.3" });
write("packages/unversioned", { name: "unversioned" });

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("workspaceVersion", () => {
  it("reads the named package version", () => {
    expect(workspaceVersion(root, "@rxova/core", readFile)).toBe("1.2.3");
  });

  it("throws for a missing package or a missing version", () => {
    expect(() => workspaceVersion(root, "nope", readFile)).toThrow(
      "no workspace package named nope under packages, apps",
    );
    expect(() => workspaceVersion(root, "unversioned", readFile)).toThrow(
      "unversioned has no version",
    );
  });
});
