import { describe, expect, it } from "vitest";
import type { Tool } from "@/init/init.types";
import { openInBrowser } from "@/internal/init/open-in-browser";

const URL = "https://github.com/organizations/ada/settings/installations/77";

const fake = (fail = false) => {
  const calls: string[][] = [];
  const run: Tool = (command, args) => {
    calls.push([command, ...args]);
    if (fail) throw new Error("spawn xdg-open ENOENT");
    return "";
  };
  return { calls, run };
};

describe("openInBrowser", () => {
  it.each([
    ["darwin", ["open", URL]],
    ["linux", ["xdg-open", URL]],
    ["win32", ["cmd", "/c", "start", "", URL]],
  ] as const)("opens the page on %s at a terminal", (platform, call) => {
    const { calls, run } = fake();
    expect(openInBrowser(run, URL, { platform, isTTY: true, env: {} })).toBe(true);
    expect(calls).toEqual([call]);
  });

  it("does not open without a terminal", () => {
    const { calls, run } = fake();
    expect(openInBrowser(run, URL, { platform: "darwin", isTTY: false, env: {} })).toBe(false);
    expect(calls).toEqual([]);
  });

  it("does not open in CI", () => {
    const { calls, run } = fake();
    expect(openInBrowser(run, URL, { platform: "darwin", isTTY: true, env: { CI: "true" } })).toBe(
      false,
    );
    expect(calls).toEqual([]);
  });

  it("does not open on an unknown platform", () => {
    const { calls, run } = fake();
    expect(openInBrowser(run, URL, { platform: "aix", isTTY: true, env: {} })).toBe(false);
    expect(calls).toEqual([]);
  });

  it("ignores an opener that fails", () => {
    const { run } = fake(true);
    expect(openInBrowser(run, URL, { platform: "linux", isTTY: true, env: {} })).toBe(false);
  });
});
