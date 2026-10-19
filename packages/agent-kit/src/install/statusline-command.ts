import type { InstallEnv } from "@/install/install.types";
import { installCommand } from "@/install/install-command";
import { resolveTargets } from "@/install/resolve-targets";
import { uninstallCommand } from "@/install/uninstall-command";
import { defaultEnv } from "@/internal/install/default-env";
import { parseOptions } from "@/internal/install/parse-options";
import { readManifest } from "@/internal/install/read-manifest";

/**
 * `rxova-agent-kit statusline [--target claude|opencode|both] [--project] [--remove] [--dry-run]
 * [--force]`: the status line on its own, for Claude Code unless another target is named.
 *
 * Each target is decided on its own manifest: where the kit is not installed there, it installs
 * the `none` profile with the status line, so no agent, skill or hook comes with it; where it is
 * installed, it keeps that selection and switches the status line on. Reading one target's
 * manifest to decide another's would install a profile nobody asked for — a machine with the kit
 * in Claude Code and nothing in OpenCode would have taken `core` there.
 *
 * `--remove` switches it off again, and removes the kit from a target entirely when the status
 * line was all it had.
 */
export const statuslineCommand = (
  argv: readonly string[],
  env: InstallEnv = defaultEnv(),
): number => {
  try {
    const options = parseOptions(argv, ["project", "dry-run", "force", "remove", "target"]);
    const project = options.project === true;
    const targets = resolveTargets(
      typeof options.target === "string" ? options.target : "claude",
      project,
      env,
    );
    let code = 0;
    for (const target of targets) {
      const previous = readManifest(target.root);
      const shared = [
        "--target",
        target.kind,
        ...(project ? ["--project"] : []),
        ...(options["dry-run"] === true ? ["--dry-run"] : []),
      ];
      const result =
        options.remove === true
          ? previous === undefined || previous.items.length === 0
            ? uninstallCommand(shared, env)
            : installCommand([...shared, "--no-statusline"], env)
          : installCommand(
              [
                ...shared,
                "--statusline",
                ...(previous === undefined ? ["--profile", "none"] : []),
                ...(options.force === true ? ["--force"] : []),
              ],
              env,
            );
      if (result !== 0) code = result;
    }
    return code;
  } catch (failure) {
    env.io.err(`rxova-agent-kit statusline: ${(failure as Error).message}`);
    return 1;
  }
};
