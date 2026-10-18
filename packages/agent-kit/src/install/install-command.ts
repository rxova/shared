import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { InstallEnv } from "@/install/install.types";
import { catalog } from "@/install/catalog";
import { hookGroups } from "@/install/hook-groups";
import { installedTargets } from "@/install/installed-targets";
import { planInstall } from "@/install/plan-install";
import { selectItems } from "@/install/select-items";
import { withOwnHooks } from "@/install/with-own-hooks";
import { withOwnStatusLine } from "@/install/with-own-status-line";
import { withOwnTuiPlugin } from "@/install/with-own-tui-plugin";
import { defaultEnv } from "@/internal/install/default-env";
import { fromTarget } from "@/internal/install/from-target";
import { MANIFEST, RUNNER, STATUSLINE } from "@/internal/install/install-paths";
import { isOwnStatusLine } from "@/internal/install/is-own-status-line";
import { packageVersionAt } from "@/internal/install/package-version-at";
import { parseOptions } from "@/internal/install/parse-options";
import { readCli } from "@/internal/install/read-cli";
import { readManifest } from "@/internal/install/read-manifest";
import { readSettings } from "@/internal/install/read-settings";
import { removeFiles } from "@/internal/install/remove-files";
import { tuiPluginDir } from "@/internal/install/tui-plugin-dir";
import { writeJson } from "@/internal/install/write-json";

/**
 * `rxova-agent-kit install [--target claude|opencode|both] [--profile core|hackathon|dotnet|react|qa|marketing|full|none]
 * [--add a,b] [--skip c] [--statusline | --no-statusline] [--project] [--dry-run] [--force]`:
 * writes the chosen agents, skills and hooks for Claude Code, OpenCode or both, and, with
 * `--statusline`, draws the kit's status line: Claude Code runs the script, OpenCode loads the
 * plugin. It records what it wrote in
 * each. Running it again updates in place, keeping each target's last selection and status line
 * choice unless told otherwise; with no
 * `--target`, it updates the targets already installed (Claude Code on a first install).
 */
export const installCommand = (argv: readonly string[], env: InstallEnv = defaultEnv()): number => {
  const { io } = env;
  try {
    const options = parseOptions(argv, [
      "project",
      "dry-run",
      "force",
      "statusline",
      "profile",
      "add",
      "skip",
      "target",
    ]);
    for (const built of ["hooks.js", "statusline.js", "statusline-rows.js"])
      if (!existsSync(join(env.packageDir, "dist", built)))
        throw new Error(`dist/${built} is missing; build the package first`);
    const targets = installedTargets(options.target, options.project === true, env);
    const items = catalog(env.packageDir);
    const both = targets.length > 1;

    const plans = targets.map((target) => {
      const previous = readManifest(target.root);
      const selection = selectItems({
        names: items.map(({ name }) => name),
        profile: options.profile,
        add: options.add ?? [],
        skip: options.skip ?? [],
        previous,
      });
      // Both hosts can draw it: Claude Code runs the script from settings.json, OpenCode loads
      // the plugin from cli.json.
      const statusline = options.statusline ?? previous?.statusline ?? false;
      const plan = planInstall({
        packageDir: env.packageDir,
        items: selection.items,
        previous,
        exists: (file) => existsSync(fromTarget(target.root, file)),
        target,
        withSkills: !(both && target.kind === "opencode"),
        withStatusline: statusline,
      });
      const written = plan.copies.map(({ to }) => to);
      const counts = (["agent", "skill", "hook"] as const)
        .map(
          (kind) =>
            `${String(items.filter((item) => item.kind === kind && selection.items.includes(item.name)).length)} ${kind}s`,
        )
        .join(", ");
      // Read and check settings.json before anything is written, so a broken file stops the
      // install cleanly instead of leaving copies the manifest does not record.
      const hookNames = selection.items.filter((item) =>
        items.some((entry) => entry.name === item && entry.kind === "hook"),
      );
      const current = target.kind === "claude" ? readSettings(target.root) : {};
      const settings =
        target.kind === "claude"
          ? withOwnStatusLine(
              withOwnHooks(current, hookGroups(fromTarget(target.root, RUNNER), hookNames)),
              statusline ? fromTarget(target.root, STATUSLINE) : undefined,
            )
          : undefined;
      // OpenCode loads its status line from cli.json, and several plugins may sit there, so the
      // kit's entry is added beside them rather than replacing the list.
      const currentCli = target.kind === "opencode" ? readCli(target.root) : undefined;
      const nextCli =
        currentCli &&
        withOwnTuiPlugin(currentCli, statusline ? tuiPluginDir(target.root) : undefined);
      // Only written when it actually changes, so an OpenCode install without the status line
      // leaves no cli.json behind.
      const cli =
        nextCli !== undefined && JSON.stringify(nextCli) !== JSON.stringify(currentCli)
          ? nextCli
          : undefined;
      // Claude Code has one status line: someone else's counts as a conflict, like a file.
      const statusLineConflict =
        statusline && current.statusLine !== undefined && !isOwnStatusLine(current.statusLine);
      return {
        target,
        previous,
        selection,
        plan,
        written,
        stale: (previous?.files ?? []).filter((file) => !written.includes(file)),
        counts,
        settings,
        cli,
        statusline,
        statusLineConflict,
      };
    });

    const conflicts = plans.flatMap(({ target, plan, statusLineConflict }) => [
      ...plan.conflicts.map((file) => fromTarget(target.root, file)),
      ...(statusLineConflict ? [`${join(target.root, "settings.json")} (statusLine)`] : []),
    ]);
    if (conflicts.length > 0 && options.force !== true)
      throw new Error(
        `these already exist and were not written by rxova-agent-kit:\n${conflicts.map((file) => `  ${file}`).join("\n")}\n` +
          "Move them, or pass --force to overwrite.",
      );

    for (const {
      target,
      previous,
      selection,
      plan,
      written,
      stale,
      counts,
      settings,
      cli,
      statusline,
    } of plans) {
      const name = target.kind === "claude" ? "Claude Code" : "OpenCode";
      if (options["dry-run"] === true) {
        io.out(
          `Would install the ${selection.profile} selection (${counts}) for ${name} into ${target.root}:`,
        );
        for (const file of written) io.out(`  write   ${file}`);
        for (const file of stale) io.out(`  remove  ${file}`);
        if (target.kind === "claude")
          io.out(
            `  update  settings.json (the rx-ai hooks${statusline ? " and status line" : ""})`,
          );
        else if (statusline) io.out("  update  cli.json (the rx-ai status line)");
        continue;
      }
      for (const copy of plan.copies) {
        const path = fromTarget(target.root, copy.to);
        mkdirSync(dirname(path), { recursive: true });
        if (copy.text === undefined) copyFileSync(copy.from, path);
        else writeFileSync(path, copy.text);
      }
      removeFiles(target.root, stale);
      const createdSettings =
        target.kind === "claude" &&
        (previous?.createdSettings ?? !existsSync(join(target.root, "settings.json")));
      if (settings !== undefined) writeJson(join(target.root, "settings.json"), settings);
      if (cli !== undefined) writeJson(join(target.root, "cli.json"), cli);
      writeJson(fromTarget(target.root, MANIFEST), {
        version: packageVersionAt(env.packageDir),
        profile: selection.profile,
        items: selection.items,
        files: written,
        createdSettings,
        statusline,
      });
      io.out(`Installed rx-ai (${selection.profile}: ${counts}) for ${name} into ${target.root}.`);
    }
    return 0;
  } catch (failure) {
    io.err(`rxova-agent-kit install: ${(failure as Error).message}`);
    return 1;
  }
};
