import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkBundleCommand } from "@/bundle/check-bundle-command";

const reader =
  (files: Record<string, string>) =>
  (file: string): string | undefined =>
    files[file.replaceAll("\\", "/")];

describe("checkBundleCommand", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes a clean entry and counts the chunks it reached", () => {
    const read = reader({
      "/p/package.json": "{}",
      "/p/dist/index.js": `export { a } from "./chunk.js";`,
      "/p/dist/chunk.js": `export const a = globalThis.process?.env;`,
    });
    expect(checkBundleCommand("/p", read)).toBe(0);
    expect(console.log).toHaveBeenCalledWith("check-bundle: 2 file(s) free of process");
  });

  it("fails on a free process in a chunk the entry reaches", () => {
    const read = reader({
      "/p/package.json": "{}",
      "/p/dist/index.js": `export { a } from "./chunk.js";`,
      "/p/dist/chunk.js": `export const a = process.env.NODE_ENV;`,
    });
    expect(checkBundleCommand("/p", read)).toBe(1);
    expect(vi.mocked(console.error).mock.calls[0]?.[0]).toContain("dist/chunk.js:1 process");
  });

  it("checks only the entries listed, so a subpath may keep the reference", () => {
    const read = reader({
      "/p/package.json": JSON.stringify({
        repoConfig: { bundle: { entries: ["dist/index.js"], banned: ["process", "require"] } },
      }),
      "/p/dist/index.js": `export const a = 1;`,
      "/p/dist/env.js": `export const b = process.env.NODE_ENV;`,
    });
    expect(checkBundleCommand("/p", read)).toBe(0);
  });

  it("skips a chunk the entry names but that is not on disk", () => {
    const read = reader({
      "/p/package.json": "{}",
      "/p/dist/index.js": `export { a } from "./gone.js";`,
    });
    expect(checkBundleCommand("/p", read)).toBe(0);
    expect(console.log).toHaveBeenCalledWith("check-bundle: 2 file(s) free of process");
  });

  it("asks for a build when an entry is not there", () => {
    expect(checkBundleCommand("/p", reader({ "/p/package.json": "{}" }))).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      "check-bundle: build first — no dist/index.js in /p",
    );
  });

  it("reports a broken manifest rather than throwing", () => {
    expect(checkBundleCommand("/p", reader({ "/p/package.json": "{" }))).toBe(1);
    expect(vi.mocked(console.error).mock.calls[0]?.[0]).toContain("check-bundle failed —");
  });
});
