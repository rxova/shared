import { homedir } from "node:os";
import type { InstallEnv } from "@/install/install.types";
import { consoleIo } from "@/internal/cli/console-io";
import { xdgConfigHome } from "@/internal/install/xdg-config-home";
import { packageRoot } from "@/internal/cli/package-root";

/** The real home, working directory, package and console. */
export const defaultEnv = (): InstallEnv => ({
  home: homedir(),
  // XDG: an empty XDG_CONFIG_HOME means the default, just like an unset one.
  configHome: xdgConfigHome(process.env.XDG_CONFIG_HOME, homedir()),
  cwd: process.cwd(),
  packageDir: packageRoot(import.meta.url),
  io: consoleIo,
});
