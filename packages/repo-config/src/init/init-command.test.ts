import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Tool } from "@/init/init.types";
import { initCommand } from "@/init/init-command";

const ROOT = "/repo";

/** The in-memory tree is keyed with `/`; `path.join` hands it `\\` on Windows. */
const key = (file: string): string => file.replaceAll("\\", "/");

/** An in-memory template checkout, and a fake `gh`/`git` that records its calls. */
const setup = ({
  repo = "ada/idea",
  example = true,
  visibility = "PUBLIC",
  pages = (): string => "",
  settings = (): string => "",
  files: extra = {},
}: {
  repo?: string;
  example?: boolean;
  visibility?: string;
  pages?: () => string;
  settings?: () => string;
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
          [`${ROOT}/docs.md`]: "import { greet } from '@rxova/example'; // packages/example\n",
        }
      : {}),
    ...extra,
  };
  const calls: string[] = [];
  const run: Tool = (command, args) => {
    calls.push([command, ...args].join(" "));
    if (command === "gh" && args[0] === "repo") {
      return args.includes("visibility") ? visibility : repo;
    }
    if (command === "git" && args.includes("ls-files")) {
      return Object.keys(files)
        .map((file) => file.slice(ROOT.length + 1))
        .join("\0");
    }
    if (command === "gh" && args[0] === "api") return args[2] === "PATCH" ? settings() : pages();
    return "";
  };
  const deps = {
    root: ROOT,
    run,
    read: (file: string) => files[key(file)],
    write: (file: string, contents: string) => {
      files[key(file)] = contents;
    },
    exists: (file: string) => key(file) in files,
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
      "gh label clone rxova/template-oss --repo ada/idea --force",
      "gh api -X POST repos/ada/idea/pages -f build_type=workflow",
    ]);
    const output = log.join("\n");
    expect(output).toContain("init: ada/idea is public");
    expect(output).toContain("repository ada/idea, workflow release.yml");
    expect(output).not.toContain("Settings → Pages");
    expect(output).not.toContain("RXOVA_APP_ID");
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
    ]);
    expect(log.join("\n")).toContain("would move packages/example to packages/idea");
    expect(log.join("\n")).toContain("would turn GitHub Pages on");
  });

  it("on a private repository turns on auto-merge instead of Pages and lists the org steps", () => {
    const { calls, deps } = setup({ visibility: "PRIVATE" });
    expect(initCommand([], deps)).toBe(0);
    expect(calls).toEqual([
      'gh repo view --json owner,name --jq .owner.login + "/" + .name',
      "gh repo view --json visibility -q .visibility",
      "git -C /repo mv packages/example packages/idea",
      "git -C /repo ls-files -z",
      "gh label clone rxova/template-oss --repo ada/idea --force",
      "gh api -X PATCH repos/ada/idea -F allow_auto_merge=true -F delete_branch_on_merge=true",
    ]);
    const output = log.join("\n");
    expect(output).toContain("init: ada/idea is private");
    expect(output).toContain("install the rxova GitHub App on ada/idea");
    expect(output).toContain("RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY");
    expect(output).toContain("`all checks`");
    expect(output).not.toContain("Pages");
    expect(output).not.toContain("trusted publisher");
    expect(output).not.toContain("Settings → General");
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
    ]);
    const output = log.join("\n");
    expect(output).toContain("would turn on auto-merge and delete head branches on merge");
    expect(output).toContain("RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY");
    expect(output).not.toContain("Pages");
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
