import type { InstallEnv } from "@/install/install.types";
import { installCommand } from "@/install/install-command";
import { uninstallCommand } from "@/install/uninstall-command";
import { defaultEnv } from "@/internal/install/default-env";
import { parseOptions } from "@/internal/install/parse-options";
import { readManifest } from "@/internal/install/read-manifest";
import { targetDir } from "@/internal/install/target-dir";

/**
 * `rxova-agent-kit statusline [--project] [--remove] [--dry-run] [--force]`: the status line on its
 * own. Where the kit is not installed, it installs the `none` profile with the status line, so no
 * agent, skill or hook comes with it; where the kit is installed, it keeps that selection and
 * switches the status line on. `--remove` switches it off again, and removes the kit entirely
 * when the status line was all there was.
 */
export const statuslineCommand = (
  argv: readonly string[],
  env: InstallEnv = defaultEnv(),
): number => {
  try {
    const options = parseOptions(argv, ["project", "dry-run", "force", "remove"]);
    const previous = readManifest(targetDir(options.project === true, env));
    const shared = [
      "--target",
      "claude",
      ...(options.project === true ? ["--project"] : []),
      ...(options["dry-run"] === true ? ["--dry-run"] : []),
    ];
    if (options.remove === true) {
      if (previous === undefined || previous.items.length === 0)
        return uninstallCommand(shared, env);
      return installCommand([...shared, "--no-statusline"], env);
    }
    return installCommand(
      [
        ...shared,
        "--statusline",
        ...(previous === undefined ? ["--profile", "none"] : []),
        ...(options.force === true ? ["--force"] : []),
      ],
      env,
    );
  } catch (failure) {
    env.io.err(`rxova-agent-kit statusline: ${(failure as Error).message}`);
    return 1;
  }
};
