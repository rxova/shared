import type { FixtureRun } from "@/config/config.types";
import { assertOnlyKeys } from "@/internal/config/assert-only-keys";
import { compact } from "@/internal/config/compact";
import { failConfig } from "@/internal/config/fail-config";
import { isRecord } from "@/internal/config/is-record";
import { readSection } from "@/internal/config/read-section";
import { readString } from "@/internal/config/read-string";
import { readStrings } from "@/internal/config/read-strings";

/** `packSmoke.run`: `{ bin, args?, fixture?: { path, contents }, expect }` entries. */
export const parseFixtureRuns = (value: unknown, path: string): FixtureRun[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return failConfig(path, "an array");
  return value.map((run: unknown, index) => {
    const at = `${path}[${String(index)}]`;
    if (!isRecord(run)) return failConfig(at, "a { bin, args, fixture?, expect } object");
    assertOnlyKeys(run, at, ["bin", "args", "fixture", "expect"]);
    const bin = readString(run, "bin", at);
    const expect = readStrings(run, "expect", at);
    if (bin === undefined || expect === undefined) {
      return failConfig(at, "a { bin, args, fixture?, expect } object");
    }
    const fixture = readSection(run, "fixture", at, ["path", "contents"]);
    const fixturePath = fixture && readString(fixture, "path", `${at}.fixture`);
    const contents = fixture?.contents;
    if (fixture !== undefined && (fixturePath === undefined || typeof contents !== "string")) {
      return failConfig(`${at}.fixture`, "a { path, contents } pair of strings");
    }
    return compact<FixtureRun>({
      bin,
      args: readStrings(run, "args", at) ?? [],
      fixture:
        fixturePath === undefined ? undefined : { path: fixturePath, contents: contents as string },
      expect,
    });
  });
};
