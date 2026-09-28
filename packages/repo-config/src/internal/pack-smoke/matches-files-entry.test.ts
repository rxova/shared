import { describe, expect, it } from "vitest";
import { matchesFilesEntry } from "@/internal/pack-smoke/matches-files-entry";

describe("matchesFilesEntry", () => {
  it("matches the file an entry names", () => {
    expect(matchesFilesEntry("assets/logo.svg", "assets/logo.svg")).toBe(true);
    expect(matchesFilesEntry("assets/logo.svg", "assets/icon.svg")).toBe(false);
  });

  it("matches everything under a directory an entry names", () => {
    expect(matchesFilesEntry("dist", "dist/nested/index.js")).toBe(true);
    expect(matchesFilesEntry("assets/*", "assets/icons/a.svg")).toBe(true);
    expect(matchesFilesEntry("dist", "distribution/index.js")).toBe(false);
  });
});
