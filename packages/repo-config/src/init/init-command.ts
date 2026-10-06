import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Reader } from "@/config/config.types";
import type { Rename, Repository, Tool } from "@/init/init.types";
import { readFile } from "@/internal/config/read-file";
import { isPrivateRepository } from "@/internal/init/is-private-repository";
import { nextSteps } from "@/internal/init/next-steps";
import { privateNextSteps } from "@/internal/init/private-next-steps";
import { renameFiles } from "@/internal/init/rename-files";
import { repositoryOf } from "@/internal/init/repository-of";
import { runTool } from "@/internal/init/run-tool";

const USAGE = [
  "usage: rxova-repo-config init [--dry-run]",
  "",
  "Run once, in a repository just created from a template. It renames the template",
  "to this repository everywhere, renames packages/example after it, copies the",
  "template's labels and turns GitHub Pages on. In a private repository it turns on",
  "auto-merge and branch deletion instead of Pages, and lists the GitHub App, secrets",
  "and required check to set up rather than the npm steps. --dry-run only says what",
  "it would do.",
].join("\n");

const slug = ({ owner, name }: Repository): string => `${owner}/${name}`;

const readJson = (read: Reader, file: string): Record<string, unknown> => {
  const text = read(file);
  if (text === undefined) throw new Error(`${file} is missing`);
  return JSON.parse(text) as Record<string, unknown>;
};

/**
 * `rxova-repo-config init [--dry-run]`: turns a repository created from a
 * template into its own project. The template is the repository the root
 * `package.json` still points at; this repository is the one `gh` reports for
 * the working directory. A private repository gets auto-merge and branch
 * deletion instead of Pages, and no npm steps. Repository rulesets are not copied: in an organisation
 * they come from the organisation's rulesets. Returns the process exit code.
 */
export const initCommand = (
  argv: readonly string[],
  {
    root = process.cwd(),
    run = runTool,
    read = readFile,
    write = (file: string, contents: string) => {
      writeFileSync(file, contents);
    },
    exists = existsSync,
  }: {
    root?: string;
    run?: Tool;
    read?: Reader;
    write?: (file: string, contents: string) => void;
    exists?: (path: string) => boolean;
  } = {},
): number => {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(USAGE);
    return 0;
  }
  const dryRun = argv.includes("--dry-run");
  const act = (what: string, work: () => void): void => {
    console.log(`init: ${dryRun ? "would " : ""}${what}`);
    if (!dryRun) work();
  };

  try {
    const manifest = readJson(read, join(root, "package.json"));
    const template = repositoryOf(manifest.repository);
    const [owner = "", name = ""] = run("gh", [
      "repo",
      "view",
      "--json",
      "owner,name",
      "--jq",
      '.owner.login + "/" + .name',
    ]).split("/");
    const target: Repository = { owner, name };
    if (slug(target) === slug(template)) {
      throw new Error(`this is ${slug(template)} itself; run init in a repository created from it`);
    }
    const privateRepository = isPrivateRepository(run);
    console.log(`init: ${slug(target)} is ${privateRepository ? "private" : "public"}`);

    const renames: Rename[] = [[slug(template), slug(target)]];
    if (typeof manifest.name === "string" && manifest.name !== target.name) {
      renames.push([manifest.name, target.name]);
    }

    const example = join(root, "packages", "example");
    if (exists(join(example, "package.json"))) {
      const packageName = readJson(read, join(example, "package.json")).name;
      if (typeof packageName === "string") {
        renames.unshift([packageName, packageName.replace(/[^/]+$/, target.name)]);
      }
      renames.push(["packages/example", `packages/${target.name}`]);
      act(`move packages/example to packages/${target.name}`, () => {
        run("git", ["-C", root, "mv", "packages/example", `packages/${target.name}`]);
      });
    }

    const files = run("git", ["-C", root, "ls-files", "-z"]).split("\0").filter(Boolean);
    for (const [from, to] of renames) console.log(`init: rename "${from}" → "${to}"`);
    if (!dryRun) {
      const changed = renameFiles(root, files, renames, { read, write });
      console.log(`init: rewrote ${String(changed.length)} file(s)`);
    }

    act(`copy the labels of ${slug(template)}`, () => {
      run("gh", ["label", "clone", slug(template), "--repo", slug(target), "--force"]);
    });

    if (privateRepository) {
      let settings = true;
      act("turn on auto-merge and delete head branches on merge", () => {
        try {
          run("gh", [
            "api",
            "-X",
            "PATCH",
            `repos/${slug(target)}`,
            "-F",
            "allow_auto_merge=true",
            "-F",
            "delete_branch_on_merge=true",
          ]);
        } catch {
          settings = false;
          console.log("init: could not change the repository settings; do it by hand (below)");
        }
      });
      console.log(["", ...privateNextSteps(target, settings)].join("\n"));
      return 0;
    }

    let pages = true;
    act("turn GitHub Pages on (source: GitHub Actions)", () => {
      try {
        run("gh", [
          "api",
          "-X",
          "POST",
          `repos/${slug(target)}/pages`,
          "-f",
          "build_type=workflow",
        ]);
      } catch (failure) {
        pages = /already|409/i.test((failure as Error).message);
        if (!pages) console.log("init: could not turn Pages on; do it by hand (below)");
      }
    });

    console.log(["", ...nextSteps(target, pages)].join("\n"));
    return 0;
  } catch (failure) {
    console.error(`init: ${(failure as Error).message}`);
    return 1;
  }
};
