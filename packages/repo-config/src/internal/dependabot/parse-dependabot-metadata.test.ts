import { describe, expect, it } from "vitest";
import { parseDependabotMetadata } from "@/internal/dependabot/parse-dependabot-metadata";

const message = (...block: string[]) =>
  [
    "chore(deps): bump things",
    "",
    "Bumps things.",
    "",
    "---",
    ...block,
    "...",
    "",
    "Signed-off-by: dependabot[bot]",
  ].join("\n");

describe("parseDependabotMetadata", () => {
  it("reads a single update", () => {
    expect(
      parseDependabotMetadata(
        message(
          "updated-dependencies:",
          "- dependency-name: vitest",
          "  dependency-version: 5.1.0",
          "  dependency-type: direct:development",
          "  update-type: version-update:semver-minor",
        ),
      ),
    ).toEqual({ names: ["vitest"], updateTypes: ["minor"] });
  });

  it("reads every entry of a group, unquoting names and keeping each once", () => {
    expect(
      parseDependabotMetadata(
        message(
          "updated-dependencies:",
          '- dependency-name: "@types/node"',
          "  update-type: version-update:semver-patch",
          "- dependency-name: eslint",
          "  update-type: 'version-update:semver-major'",
          "- dependency-name: '@types/node'",
          "  update-type: version-update:semver-minor",
        ).replace(/\n/g, "\r\n"),
      ),
    ).toEqual({ names: ["@types/node", "eslint"], updateTypes: ["patch", "major", "minor"] });
  });

  it("reads nothing from a message without the block", () => {
    expect(parseDependabotMetadata("fix: a plain commit\n\n---\nnot: metadata\n")).toEqual({
      names: [],
      updateTypes: [],
    });
  });

  it("skips what it does not recognise and stops at the end marker", () => {
    expect(
      parseDependabotMetadata(
        [
          "---",
          "updated-dependencies:",
          "- dependency-name:",
          "  update-type: version-update:semver-huge",
          "  update-type: security-update",
          "...",
          "- dependency-name: after-the-end",
          "  update-type: version-update:semver-major",
        ].join("\n"),
      ),
    ).toEqual({ names: [], updateTypes: [] });
  });
});
