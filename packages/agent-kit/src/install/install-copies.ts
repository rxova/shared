import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hooks } from "@/hooks/hooks-table";
import type { Copy, InstallTarget } from "@/install/install.types";
import { opencodeAgent } from "@/install/opencode-agent";
import { opencodeHooks } from "@/install/opencode-hooks";
import { opencodePlugin } from "@/install/opencode-plugin";
import { contentFiles } from "@/internal/install/content-files";
import { fromTarget } from "@/internal/install/from-target";
import { PLUGIN, RUNNER } from "@/internal/install/install-paths";

/**
 * The files an install writes for the chosen items into one target. Claude Code: each chosen
 * agent's file and skill's folder from `content/` as they are, and the hook runner. OpenCode:
 * the agents converted to its format, the skills (left out when `withSkills` is false, because
 * OpenCode already reads them from the Claude Code install), the runner, and the plugin that
 * calls it.
 */
export const installCopies = (
  packageDir: string,
  items: readonly string[],
  target: InstallTarget = { kind: "claude", root: "/" },
  { withSkills = true }: { withSkills?: boolean } = {},
): Copy[] => {
  const content = join(packageDir, "content");
  const chosen = new Set(items);
  const files = contentFiles(content).filter((file) => {
    const [kind, name = ""] = file.split("/");
    return chosen.has(kind === "agents" ? name.replace(/\.md$/, "") : name);
  });
  const copy = (file: string): Copy => ({ from: join(content, ...file.split("/")), to: file });
  const runner: Copy = { from: join(packageDir, "dist", "hooks.js"), to: RUNNER };
  if (target.kind === "claude") return [...files.map(copy), runner];

  const agents = files
    .filter((file) => file.startsWith("agents/"))
    .map((file) => ({
      to: file,
      text: opencodeAgent(readFileSync(join(content, ...file.split("/")), "utf8")),
    }));
  const skills = withSkills ? files.filter((file) => file.startsWith("skills/")).map(copy) : [];
  const hookNames = items.filter((name) => Object.hasOwn(hooks, name));
  const plugin: Copy[] =
    hookNames.length === 0
      ? []
      : [
          {
            to: PLUGIN,
            text: opencodePlugin(fromTarget(target.root, RUNNER), opencodeHooks(hookNames)),
          },
        ];
  return [...agents, ...skills, runner, ...plugin];
};
