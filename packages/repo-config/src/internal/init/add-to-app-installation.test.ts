import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Tool } from "@/init/init.types";
import { addToAppInstallation } from "@/internal/init/add-to-app-installation";

const TARGET = { owner: "ada", name: "idea" };
const LOOKUP =
  'gh api /orgs/ada/installations --jq .installations[] | select(.app_slug == "rxova-bot") | [.id, .repository_selection] | @tsv';

/** A fake `gh` that records its calls and answers the installation lookup, the repo id and the PUT. */
const fake = ({
  installation = (): string => "",
  put = (): string => "",
}: { installation?: () => string; put?: () => string } = {}) => {
  const calls: string[] = [];
  const run: Tool = (command, args) => {
    calls.push([command, ...args].join(" "));
    if (args[1]?.startsWith("/orgs/")) return installation();
    if (args.includes("PUT")) return put();
    return "123";
  };
  return { calls, run };
};

describe("addToAppInstallation", () => {
  let log: string[];
  beforeEach(() => {
    log = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => log.push(line));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("asks for the install step when the app is not on the organisation", () => {
    const { calls, run } = fake();
    expect(addToAppInstallation(run, TARGET, "rxova-bot", false)).toEqual({ step: "install" });
    expect(calls).toEqual([LOOKUP]);
    expect(log.join("\n")).toContain("rxova-bot is not installed on ada");
  });

  it("does nothing when the installation covers every repository", () => {
    const { calls, run } = fake({ installation: () => "77\tall" });
    expect(addToAppInstallation(run, TARGET, "rxova-bot", false)).toEqual({ step: "done" });
    expect(calls).toEqual([LOOKUP]);
    expect(log.join("\n")).toContain("already covers every repository");
  });

  it("adds the repository to an installation on selected repositories", () => {
    const { calls, run } = fake({ installation: () => "77\tselected" });
    expect(addToAppInstallation(run, TARGET, "rxova-bot", false)).toEqual({ step: "done" });
    expect(calls).toEqual([
      LOOKUP,
      "gh api repos/ada/idea --jq .id",
      "gh api -X PUT /user/installations/77/repositories/123",
    ]);
    expect(log).toContain("init: added ada/idea to the rxova-bot installation");
  });

  it("asks for the configure step, with the installation, when gh refuses the change", () => {
    const { run } = fake({
      installation: () => "77\tselected",
      put: () => {
        throw new Error(
          "HTTP 403: You must authenticate with an access token authorized to a GitHub App",
        );
      },
    });
    expect(addToAppInstallation(run, TARGET, "rxova-bot", false)).toEqual({
      step: "configure",
      installationId: "77",
    });
    expect(log.join("\n")).toContain("could not add ada/idea to the rxova-bot installation");
  });

  it("asks for the configure step when gh cannot read the installations", () => {
    const { run } = fake({
      installation: () => {
        throw new Error("HTTP 404: Not Found");
      },
    });
    expect(addToAppInstallation(run, TARGET, "rxova-bot", false)).toEqual({
      step: "configure",
      installationId: undefined,
    });
    expect(log.join("\n")).toContain("could not read the app installations of ada");
  });

  it("looks up and names the app it is given", () => {
    const { calls, run } = fake({ installation: () => "88\tselected" });
    expect(addToAppInstallation(run, TARGET, "renovate", false)).toEqual({ step: "done" });
    expect(calls).toEqual([
      'gh api /orgs/ada/installations --jq .installations[] | select(.app_slug == "renovate") | [.id, .repository_selection] | @tsv',
      "gh api repos/ada/idea --jq .id",
      "gh api -X PUT /user/installations/88/repositories/123",
    ]);
    expect(log).toEqual(["init: added ada/idea to the renovate installation"]);
  });

  it("only reads the installation on a dry run", () => {
    const { calls, run } = fake({ installation: () => "77\tselected" });
    expect(addToAppInstallation(run, TARGET, "rxova-bot", true)).toEqual({ step: "done" });
    expect(calls).toEqual([LOOKUP]);
    expect(log).toContain("init: would add ada/idea to the rxova-bot installation");
  });
});
