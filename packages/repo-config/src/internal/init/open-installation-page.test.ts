import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Tool } from "@/init/init.types";
import { openInstallationPage } from "@/internal/init/open-installation-page";

const TARGET = { owner: "ada", name: "idea" };
const PAGE = "https://github.com/organizations/ada/settings/installations/77";
const CONFIGURE = { step: "configure", installationId: "77" } as const;
const TERMINAL = { platform: "darwin", isTTY: true, env: {} } as const;

/** A fake opener that records its calls. */
const fake = (fail = false) => {
  const calls: string[] = [];
  const run: Tool = (command, args) => {
    calls.push([command, ...args].join(" "));
    if (fail) throw new Error("open: no browser");
    return "";
  };
  return { calls, run };
};

describe("openInstallationPage", () => {
  let log: string[];
  beforeEach(() => {
    log = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => log.push(line));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the installation page at a terminal and says so", () => {
    const { calls, run } = fake();
    openInstallationPage(run, TARGET, CONFIGURE, TERMINAL);
    expect(calls).toEqual([`open ${PAGE}`]);
    expect(log).toEqual([`init: opened ${PAGE} — add ada/idea under Repository access`]);
  });

  it("stays quiet when the browser cannot be opened", () => {
    const { run } = fake(true);
    openInstallationPage(run, TARGET, CONFIGURE, TERMINAL);
    expect(log).toEqual([]);
  });

  it("does nothing in CI", () => {
    const { calls, run } = fake();
    openInstallationPage(run, TARGET, CONFIGURE, { ...TERMINAL, env: { CI: "true" } });
    expect(calls).toEqual([]);
  });

  it.each([
    { step: "done" },
    { step: "install" },
    { step: "configure", installationId: undefined },
  ] as const)("does nothing for %o", (app) => {
    const { calls, run } = fake();
    openInstallationPage(run, TARGET, app, TERMINAL);
    expect(calls).toEqual([]);
    expect(log).toEqual([]);
  });
});
