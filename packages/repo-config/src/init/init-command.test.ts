import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Tool } from "@/init/init.types";
import { initCommand } from "@/init/init-command";

const ROOT = "/repo";
const LOOKUP =
  'gh api /orgs/ada/installations --jq .installations[] | select(.app_slug == "rxova-bot") | [.id, .repository_selection] | @tsv';
const RENOVATE_LOOKUP =
  'gh api /orgs/ada/installations --jq .installations[] | select(.app_slug == "renovate") | [.id, .repository_selection] | @tsv';
const RENOVATE_ADD = [
  RENOVATE_LOOKUP,
  "gh api repos/ada/idea --jq .id",
  "gh api -X PUT /user/installations/77/repositories/123",
];
const SECRETS_JQ = '.secrets[] | select(.visibility == "all" or .visibility == "private") | .name';
const PRIVATE_CHECKS = [
  `gh api --paginate orgs/ada/actions/secrets --jq ${SECRETS_JQ}`,
  `gh api --paginate orgs/ada/dependabot/secrets --jq ${SECRETS_JQ}`,
  "gh repo view --json defaultBranchRef --jq .defaultBranchRef.name",
  'gh api repos/ada/idea/rules/branches/main --jq .[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context',
];
const PRETTIER = "pnpm -C /repo exec prettier --write --ignore-unknown";
const PAGE = "https://github.com/organizations/ada/settings/installations/77";
const REFUSED = (): string => {
  throw new Error(
    "HTTP 403: You must authenticate with an access token authorized to a GitHub App, a personal access token, or basic auth",
  );
};

/** The in-memory tree is keyed with `/`; `path.join` hands it `\\` on Windows. */
const key = (file: string): string => file.replaceAll("\\", "/");

/** An in-memory template checkout, and a fake `gh`/`git` that records its calls. */
const setup = ({
  repo = "ada/idea",
  example = true,
  visibility = "PUBLIC",
  pages = (): string => "",
  settings = (): string => "",
  installation = (): string => "77\tselected",
  put = (): string => "",
  secrets = (): string => "",
  rules = (): string => "",
  prettier = (): string => "",
  changesets = true,
  files: extra = {},
}: {
  repo?: string;
  example?: boolean;
  visibility?: string;
  pages?: () => string;
  settings?: () => string;
  installation?: () => string;
  put?: () => string;
  secrets?: () => string;
  rules?: () => string;
  prettier?: () => string;
  changesets?: boolean;
  files?: Record<string, string>;
} = {}) => {
  const files: Record<string, string> = {
    [`${ROOT}/package.json`]: JSON.stringify({
      name: "template-oss",
      repository: { type: "git", url: "git+https://github.com/rxova/template-oss.git" },
    }),
    [`${ROOT}/README.md`]: "# template-oss\n\nhttps://github.com/rxova/template-oss\n",
    ...(example
      ? {
          [`${ROOT}/packages/example/package.json`]: JSON.stringify({ name: "@rxova/example" }),
          [`${ROOT}/packages/example/index.ts`]: "export const greet = 1;\n",
          [`${ROOT}/docs.md`]: "import { greet } from '@rxova/example'; // packages/example\n",
        }
      : {}),
    ...(changesets ? { [`${ROOT}/.changeset/config.json`]: "{}" } : {}),
    ...extra,
  };
  const calls: string[] = [];
  const run: Tool = (command, args) => {
    calls.push([command, ...args].join(" "));
    if (command === "gh" && args[0] === "repo") {
      if (args.includes("defaultBranchRef")) return "main";
      return args.includes("visibility") ? visibility : repo;
    }
    if (command === "pnpm") return prettier();
    if (command === "git" && args.includes("mv")) {
      const [from = "", to = ""] = args.slice(-2);
      for (const file of Object.keys(files)) {
        if (file.startsWith(`${ROOT}/${from}/`)) {
          files[file.replace(`${ROOT}/${from}/`, `${ROOT}/${to}/`)] = files[file] ?? "";
          Reflect.deleteProperty(files, file);
        }
      }
      return "";
    }
    if (command === "git" && args.includes("ls-files")) {
      return Object.keys(files)
        .map((file) => file.slice(ROOT.length + 1))
        .join("\0");
    }
    if (command === "gh" && args[0] === "api") {
      if (args[1]?.startsWith("/orgs/")) return installation();
      if (args[1] === "--paginate") return secrets();
      if (args[1]?.includes("/rules/")) return rules();
      if (args[2] === "PUT") return put();
      if (args.includes(".id")) return "123";
      return args[2] === "PATCH" ? settings() : pages();
    }
    return "";
  };
  const deps = {
    root: ROOT,
    run,
    read: (file: string) => files[key(file)],
    write: (file: string, contents: string) => {
      files[key(file)] = contents;
    },
    exists: (file: string) =>
      key(file) in files || Object.keys(files).some((path) => path.startsWith(`${key(file)}/`)),
    platform: "darwin" as const,
    isTTY: false,
    env: {},
  };
  return { files, calls, deps };
};

describe("initCommand", () => {
  let log: string[];
  beforeEach(() => {
    log = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => log.push(line));
    vi.spyOn(console, "error").mockImplementation((line: string) => log.push(line));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints its usage", () => {
    expect(initCommand(["--help"])).toBe(0);
    expect(log.join("\n")).toContain("usage: rxova-repo-config init");
  });

  it("renames the template, moves the example package, copies labels and turns Pages on", () => {
    const { files, calls, deps } = setup();
    expect(initCommand([], deps)).toBe(0);
    expect(files[`${ROOT}/README.md`]).toBe("# idea\n\nhttps://github.com/ada/idea\n");
    expect(files[`${ROOT}/docs.md`]).toBe(
      "import { greet } from '@rxova/idea'; // packages/idea\n",
    );
    expect(calls).toEqual([
      'gh repo view --json owner,name --jq .owner.login + "/" + .name',
      "gh repo view --json visibility -q .visibility",
      "git -C /repo mv packages/example packages/idea",
      "git -C /repo ls-files -z",
      `${PRETTIER} package.json README.md docs.md packages/idea/package.json packages/idea/index.ts`,
      "gh label clone rxova/template-oss --repo ada/idea --force",
      "gh api -X POST repos/ada/idea/pages -f build_type=workflow",
      ...RENOVATE_ADD,
    ]);
    const output = log.join("\n");
    expect(output).toContain("init: ada/idea is public");
    expect(output).toContain("init: added ada/idea to the renovate installation");
    expect(output).not.toContain("Repository access");
    expect(output).toContain("repository ada/idea, workflow release.yml");
    expect(output).not.toContain("Settings → Pages");
    expect(output).not.toContain("RXOVA_APP_ID");
    expect(output).not.toContain("rxova-bot");
    expect(output).not.toContain("changeset");
    expect(files[`${ROOT}/.changeset/idea-start.md`]).toBeUndefined();
  });

  it("formats the rewritten files and carries on when prettier fails", () => {
    const { deps } = setup({
      prettier: () => {
        throw new Error("Command failed: pnpm exec prettier\nERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL");
      },
    });
    expect(initCommand([], deps)).toBe(0);
    const output = log.join("\n");
    expect(output).toContain(
      "init: could not run prettier on 5 file(s); format them before you commit",
    );
    expect(output).toContain("trusted publisher");
  });

  it("changes nothing on a dry run", () => {
    const { files, calls, deps } = setup();
    const before = { ...files };
    expect(initCommand(["--dry-run"], deps)).toBe(0);
    expect(files).toEqual(before);
    expect(calls).toEqual([
      'gh repo view --json owner,name --jq .owner.login + "/" + .name',
      "gh repo view --json visibility -q .visibility",
      "git -C /repo ls-files -z",
      RENOVATE_LOOKUP,
    ]);
    expect(log.join("\n")).toContain("would move packages/example to packages/idea");
    expect(log.join("\n")).toContain("init: would add ada/idea to the renovate installation");
    expect(log.join("\n")).toContain("would format 5 file(s)");
    expect(log.join("\n")).toContain("would turn GitHub Pages on");
  });

  it("on a private repository turns on auto-merge instead of Pages, joins rxova-bot and lists the org steps", () => {
    const { files, calls, deps } = setup({ visibility: "PRIVATE" });
    expect(initCommand([], deps)).toBe(0);
    expect(calls).toEqual([
      'gh repo view --json owner,name --jq .owner.login + "/" + .name',
      "gh repo view --json visibility -q .visibility",
      "git -C /repo mv packages/example packages/idea",
      "git -C /repo ls-files -z",
      `${PRETTIER} package.json README.md docs.md packages/idea/package.json packages/idea/index.ts .changeset/idea-start.md`,
      "gh label clone rxova/template-oss --repo ada/idea --force",
      "gh api -X PATCH repos/ada/idea -F allow_auto_merge=true -F delete_branch_on_merge=true",
      LOOKUP,
      "gh api repos/ada/idea --jq .id",
      "gh api -X PUT /user/installations/77/repositories/123",
      ...PRIVATE_CHECKS,
    ]);
    expect(files[`${ROOT}/.changeset/idea-start.md`]).toBe(
      '---\n"@rxova/idea": minor\n---\n\nStart idea from rxova/template-oss.\n',
    );
    const output = log.join("\n");
    expect(output).toContain("init: ada/idea is private");
    expect(output).toContain("init: add a changeset for @rxova/idea");
    expect(output).toContain("init: added ada/idea to the rxova-bot installation");
    expect(output).not.toContain("Repository access");
    expect(output).toContain(
      "  2. give the repository the organisation secrets RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY,",
    );
    expect(output).toContain("  3. require the status check `all checks` on the default branch");
    expect(output).not.toContain("Pages");
    expect(output).not.toContain("trusted publisher");
    expect(output).not.toContain("Settings → General");
    expect([...calls, ...log].join("\n")).not.toContain("renovate");
  });

  it("on a private repository only plans on a dry run", () => {
    const { files, calls, deps } = setup({ visibility: "PRIVATE" });
    const before = { ...files };
    expect(initCommand(["--dry-run"], deps)).toBe(0);
    expect(files).toEqual(before);
    expect(calls).toEqual([
      'gh repo view --json owner,name --jq .owner.login + "/" + .name',
      "gh repo view --json visibility -q .visibility",
      "git -C /repo ls-files -z",
      LOOKUP,
      ...PRIVATE_CHECKS,
    ]);
    const output = log.join("\n");
    expect(output).toContain("would add a changeset for @rxova/idea");
    expect(output).toContain("would format 6 file(s)");
    expect(output).toContain("would turn on auto-merge and delete head branches on merge");
    expect(output).toContain("would add ada/idea to the rxova-bot installation");
    expect(output).toContain("RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY");
    expect(output).not.toContain("Pages");
    expect([...calls, ...log].join("\n")).not.toContain("renovate");
  });

  it("leaves the private settings to the user when the API refuses them", () => {
    const { deps } = setup({
      visibility: "PRIVATE",
      settings: () => {
        throw new Error("HTTP 403: Must have admin rights to Repository.");
      },
    });
    expect(initCommand([], deps)).toBe(0);
    const output = log.join("\n");
    expect(output).toContain("could not change the repository settings");
    expect(output).toContain("Settings → General");
  });

  it("asks to install rxova-bot when the organisation has no installation", () => {
    const { calls, deps } = setup({ visibility: "PRIVATE", installation: () => "" });
    expect(initCommand([], deps)).toBe(0);
    expect(calls.at(-PRIVATE_CHECKS.length - 1)).toBe(LOOKUP);
    expect(log.join("\n")).toContain(
      '  2. install rxova-bot on ada with "Only select repositories" and include ada/idea',
    );
  });

  it("leaves an installation on all repositories alone", () => {
    const { calls, deps } = setup({ visibility: "PRIVATE", installation: () => "77\tall" });
    expect(initCommand([], deps)).toBe(0);
    expect(calls.at(-PRIVATE_CHECKS.length - 1)).toBe(LOOKUP);
    const output = log.join("\n");
    expect(output).toContain("already covers every repository");
    expect(output).not.toContain("Repository access");
  });

  it("prints the installation step when GitHub refuses the change", () => {
    const { calls, deps } = setup({ visibility: "PRIVATE", put: REFUSED });
    expect(initCommand([], deps)).toBe(0);
    const output = log.join("\n");
    expect(output).toContain("could not add ada/idea to the rxova-bot installation");
    expect(output).toContain(
      `  2. add ada/idea to the rxova-bot installation: ${PAGE} → Repository access → Select repositories`,
    );
    expect(output).toContain("     (a classic personal access token with `repo` scope in GH_TOKEN");
    expect(output).toContain("  4. require the status check `all checks`");
    expect(output).not.toContain("init: opened");
    expect(calls.some((call) => call.startsWith("open "))).toBe(false);
  });

  it.each([
    ["darwin", `open ${PAGE}`],
    ["linux", `xdg-open ${PAGE}`],
    ["win32", `cmd /c start  ${PAGE}`],
  ] as const)(
    "opens the installation page on %s at a terminal when GitHub refuses the change",
    (platform, call) => {
      const { calls, deps } = setup({ visibility: "PRIVATE", put: REFUSED });
      expect(initCommand([], { ...deps, platform, isTTY: true })).toBe(0);
      expect(calls).toContain(call);
      expect(log).toContain(`init: opened ${PAGE} — add ada/idea under Repository access`);
    },
  );

  it("does not open the installation page in CI or on a dry run", () => {
    const ci = setup({ visibility: "PRIVATE", put: REFUSED });
    expect(initCommand([], { ...ci.deps, isTTY: true, env: { CI: "true" } })).toBe(0);
    expect(ci.calls.some((call) => call.startsWith("open "))).toBe(false);
    const dry = setup({ visibility: "PRIVATE", put: REFUSED });
    expect(initCommand(["--dry-run"], { ...dry.deps, isTTY: true })).toBe(0);
    expect(dry.calls.some((call) => call.startsWith("open "))).toBe(false);
    expect(log.join("\n")).not.toContain("init: opened");
  });

  it("leaves only the commit when the secrets and the required check are already set up", () => {
    const { deps } = setup({
      visibility: "PRIVATE",
      secrets: () => "RXOVA_APP_ID\nRXOVA_APP_PRIVATE_KEY",
      rules: () => "all checks",
    });
    expect(initCommand([], deps)).toBe(0);
    const output = log.join("\n");
    expect(output).toContain(
      "init: the organisation secrets RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY already reach ada/idea",
    );
    expect(output).toContain("init: the default branch already requires `all checks`");
    expect(output.endsWith("next:\n  1. pnpm install, then review `git diff` and commit")).toBe(
      true,
    );
  });

  it("names only the secrets that are missing", () => {
    const { deps } = setup({ visibility: "PRIVATE", secrets: () => "RXOVA_APP_ID" });
    expect(initCommand([], deps)).toBe(0);
    const output = log.join("\n");
    expect(output).toContain("  2. give the repository these organisation secrets:");
    expect(output).toContain("     Actions: RXOVA_APP_PRIVATE_KEY");
    expect(output).toContain("     Dependabot: RXOVA_APP_PRIVATE_KEY");
  });

  it("lists the secrets and the required check when gh cannot read them", () => {
    const failing = (): string => {
      throw new Error("HTTP 403: Resource not accessible by integration");
    };
    const { deps } = setup({ visibility: "PRIVATE", secrets: failing, rules: failing });
    expect(initCommand([], deps)).toBe(0);
    const output = log.join("\n");
    expect(output).toContain("RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY,");
    expect(output).toContain("require the status check `all checks`");
  });

  it("adds no changeset without a changeset directory or an example package", () => {
    const bare = setup({ visibility: "PRIVATE", changesets: false });
    expect(initCommand([], bare.deps)).toBe(0);
    expect(bare.files[`${ROOT}/.changeset/idea-start.md`]).toBeUndefined();
    const plain = setup({ visibility: "PRIVATE", example: false });
    expect(initCommand([], plain.deps)).toBe(0);
    expect(plain.files[`${ROOT}/.changeset/idea-start.md`]).toBeUndefined();
    expect(log.join("\n")).not.toContain("add a changeset");
  });

  it("works without an example package", () => {
    const { files, calls, deps } = setup({ example: false });
    expect(initCommand([], deps)).toBe(0);
    expect(calls.some((call) => call.includes(" mv "))).toBe(false);
    expect(files[`${ROOT}/README.md`]).toContain("# idea");
  });

  it("keeps a repository already named like the template's package", () => {
    const { deps } = setup({ repo: "ada/template-oss" });
    expect(initCommand(["--dry-run"], deps)).toBe(0);
    expect(log.join("\n")).not.toContain('rename "template-oss"');
  });

  it("treats Pages that is already on as on", () => {
    const { deps } = setup({
      pages: () => {
        throw new Error("HTTP 409: GitHub Pages is already enabled.");
      },
    });
    expect(initCommand([], deps)).toBe(0);
    expect(log.join("\n")).not.toContain("Settings → Pages");
  });

  it("leaves Pages to the user when the API refuses it", () => {
    const { deps } = setup({
      pages: () => {
        throw new Error("HTTP 422: plan does not support Pages");
      },
    });
    expect(initCommand([], deps)).toBe(0);
    const output = log.join("\n");
    expect(output).toContain("could not turn Pages on");
    expect(output).toContain("Settings → Pages");
  });

  it("leaves a renovate installation on all repositories alone", () => {
    const { calls, deps } = setup({ installation: () => "77\tall" });
    expect(initCommand([], deps)).toBe(0);
    expect(calls.at(-1)).toBe(RENOVATE_LOOKUP);
    const output = log.join("\n");
    expect(output).toContain("init: the renovate installation already covers every repository");
    expect(output).not.toContain("Repository access");
  });

  it("asks to install renovate when the organisation has no installation", () => {
    const { calls, deps } = setup({ installation: () => "" });
    expect(initCommand([], deps)).toBe(0);
    expect(calls.at(-1)).toBe(RENOVATE_LOOKUP);
    const output = log.join("\n");
    expect(output).toContain("init: renovate is not installed on ada");
    expect(output).toContain(
      '  2. install renovate on ada with "Only select repositories" and include ada/idea',
    );
    expect(output).toContain("  3. npm: publish the first version by hand");
  });

  it("numbers the renovate step among the public steps when GitHub refuses the change", () => {
    const { calls, deps } = setup({
      put: REFUSED,
      pages: () => {
        throw new Error("HTTP 422: plan does not support Pages");
      },
    });
    expect(initCommand([], deps)).toBe(0);
    const output = log.join("\n");
    expect(output).toContain("could not add ada/idea to the renovate installation");
    expect(output).toContain(
      "  2. Pages: Settings → Pages → Source: GitHub Actions (the Docs workflow waits)",
    );
    expect(output).toContain(
      `  3. add ada/idea to the renovate installation: ${PAGE} → Repository access → Select repositories`,
    );
    expect(output).toContain("  4. npm: publish the first version by hand");
    expect(output).toContain("  5. optional: a CODECOV_TOKEN secret");
    expect(output).not.toContain("init: opened");
    expect(calls.some((call) => call.startsWith("open "))).toBe(false);
  });

  it("opens the renovate installation page at a terminal, but not in CI or on a dry run", () => {
    const tty = setup({ put: REFUSED });
    expect(initCommand([], { ...tty.deps, isTTY: true })).toBe(0);
    expect(tty.calls.at(-1)).toBe(`open ${PAGE}`);
    expect(log).toContain(`init: opened ${PAGE} — add ada/idea under Repository access`);
    log.length = 0;
    const ci = setup({ put: REFUSED });
    expect(initCommand([], { ...ci.deps, isTTY: true, env: { CI: "1" } })).toBe(0);
    expect(ci.calls.some((call) => call.startsWith("open "))).toBe(false);
    const dry = setup({ put: REFUSED });
    expect(initCommand(["--dry-run"], { ...dry.deps, isTTY: true })).toBe(0);
    expect(dry.calls.some((call) => call.startsWith("open "))).toBe(false);
    expect(log.join("\n")).not.toContain("init: opened");
  });

  it("refuses to run in the template itself", () => {
    const { deps } = setup({ repo: "rxova/template-oss" });
    expect(initCommand([], deps)).toBe(1);
    expect(log.join("\n")).toContain("run init in a repository created from it");
  });

  it("fails without a package.json", () => {
    expect(initCommand([], { root: "/nowhere", read: () => undefined, run: () => "a/b" })).toBe(1);
    expect(log.join("\n")).toContain("package.json is missing");
  });

  it("fails when the example package has no name", () => {
    const { deps } = setup({
      files: { [`${ROOT}/packages/example/package.json`]: "{}" },
    });
    expect(initCommand(["--dry-run"], deps)).toBe(0);
    expect(log.join("\n")).not.toContain('rename "@rxova/example"');
  });

  it("reads and writes real files by default", () => {
    const dir = mkdtempSync(join(tmpdir(), "init-"));
    mkdirSync(join(dir, "packages"));
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "template-oss", repository: "rxova/template-oss" }),
    );
    const run: Tool = (command, args) =>
      command === "gh" && args[0] === "repo"
        ? "ada/idea"
        : args.includes("ls-files")
          ? "package.json"
          : "";
    expect(initCommand([], { root: dir, run })).toBe(0);
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))).toEqual({
      name: "idea",
      repository: "ada/idea",
    });
    rmSync(dir, { recursive: true, force: true });
  });
});
