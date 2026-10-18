import { dirname } from "node:path";
import { fromTarget } from "@/internal/install/from-target";
import { TUI_PLUGIN } from "@/internal/install/install-paths";

/** The folder OpenCode loads the kit's status line from, inside `root`. */
export const tuiPluginDir = (root: string): string => dirname(fromTarget(root, TUI_PLUGIN));
