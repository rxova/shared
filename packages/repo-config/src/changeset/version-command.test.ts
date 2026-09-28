import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { versionCommand } from "@/changeset/version-command";

const made: string[] = [];
const repo = (rootManifest: object) => {
  const root = mkdtempSync(join(tmpdir(), "version-"));
  made.push(root);
  mkdirSync(join(root, "packages", "core"), { recursive: true });
  writeFileSync(
    join(root, "packages", "core", "package.json"),
    JSON.stringify({ name: "@rxova/core", version: "2.0.0" }),
  );
  writeFileSync(join(root, "package.json"), JSON.stringify(rootManifest));
  return root;
};

afterAll(() => {
  for (const dir of made) rmSync(dir, { recursive: true, force: true });
});

describe("versionCommand", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  it("versions, then refreshes the lockfile, with nothing to sync by default", () => {
    const run = vi.fn();
    expect(versionCommand({ root: repo({ name: "root" }), run })).toBe(0);
    expect(run.mock.calls).toEqual([
      ["pnpm exec changeset version"],
      ["pnpm install --lockfile-only"],
    ]);
  });

  it("copies the source package version into the root, before the lockfile refresh", () => {
    const root = repo({
      name: "root",
      version: "1.0.0",
      repoConfig: { changeset: { syncRootVersionFrom: "@rxova/core" } },
    });
    const order: string[] = [];
    const run = (command: string) => void order.push(command);
    expect(versionCommand({ root, run })).toBe(0);
    expect(JSON.parse(readFileSync(join(root, "package.json"), "utf8"))).toMatchObject({
      version: "2.0.0",
    });
    expect(readFileSync(join(root, "package.json"), "utf8")).toMatch(
      /\n {2}"name": "root",\n[\s\S]*\}\n$/,
    );
    expect(log).toHaveBeenCalledWith("version: the root follows @rxova/core to 2.0.0");

    const write = vi.fn();
    expect(versionCommand({ root, run, write })).toBe(0);
    expect(write).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("version: the root is already at 2.0.0");
  });

  it("fails when a step fails or the source is unknown", () => {
    const root = repo({ repoConfig: { changeset: { syncRootVersionFrom: "nope" } } });
    expect(versionCommand({ root, run: () => {} })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("no workspace package named nope"));
    const boom = () => {
      throw new Error("exit 1");
    };
    expect(versionCommand({ root, run: boom })).toBe(1);
  });

  it("refuses a malformed config before running anything", () => {
    const run = vi.fn();
    expect(versionCommand({ root: repo({ repoConfig: { changeset: 1 } }), run })).toBe(1);
    expect(run).not.toHaveBeenCalled();
  });

  it("reads an absent root manifest as empty", () => {
    const root = repo({});
    const read = (file: string) =>
      file === join(root, "package.json")
        ? undefined
        : file.endsWith(join("core", "package.json"))
          ? JSON.stringify({ name: "core", version: "1.0.0" })
          : undefined;
    const write = vi.fn();
    // No root manifest means no config either: nothing to sync, nothing written.
    expect(versionCommand({ root, run: () => {}, read, write })).toBe(0);
    expect(write).not.toHaveBeenCalled();
  });
});
