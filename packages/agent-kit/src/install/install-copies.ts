import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hooks } from "@/hooks/hooks-table";
import type { Copy, InstallTarget } from "@/install/install.types";
import { opencodeAgent } from "@/install/opencode-agent";
import { opencodeHooks } from "@/install/opencode-hooks";
import { opencodePlugin } from "@/install/opencode-plugin";
import { opencodeStatusline } from "@/install/opencode-statusline";
import { contentFiles } from "@/internal/install/content-files";
import { fromTarget } from "@/internal/install/from-target";
import { PLUGIN, ROWS, RUNNER, STATUSLINE, TUI_PLUGIN } from "@/internal/install/install-paths";

/**
 * The files an install writes for the chosen items into one target. Claude Code: each chosen
 * agent's file and skill's folder from `content/` as they are, the hook runner when a hook is
 * chosen, and the status line script when `withStatusline` is true. OpenCode:
 * the agents converted to its format, the skills (left out when `withSkills` is false, because
 * OpenCode already reads them from the Claude Code install), the runner, and the plugin that
 * calls it, and, with `withStatusline`, the status line plugin and the rows it draws.
 */
export const installCopies = (
  packageDir: string,
  items: readonly string[],
  target: InstallTarget = { kind: "claude", root: "/" },
  {
    withSkills = true,
    withStatusline = false,
  }: { withSkills?: boolean; withStatusline?: boolean } = {},
): Copy[] => {
  const content = join(packageDir, "content");
  const chosen = new Set(items);
  const files = contentFiles(content).filter((file) => {
    const [kind, name = ""] = file.split("/");
    return chosen.has(kind === "agents" ? name.replace(/\.md$/, "") : name);
  });
  const copy = (file: string): Copy => ({ from: join(content, ...file.split("/")), to: file });
  const hookNames = items.filter((name) => Object.hasOwn(hooks, name));
  // The runner only earns its place when a hook will call it.
  const runner: Copy[] =
    hookNames.length === 0 ? [] : [{ from: join(packageDir, "dist", "hooks.js"), to: RUNNER }];
  const statusline: Copy[] = withStatusline
    ? [{ from: join(packageDir, "dist", "statusline.js"), to: STATUSLINE }]
    : [];
  if (target.kind === "claude") return [...files.map(copy), ...runner, ...statusline];

  const agents = files
    .filter((file) => file.startsWith("agents/"))
    .map((file) => ({
      to: file,
      text: opencodeAgent(readFileSync(join(content, ...file.split("/")), "utf8")),
    }));
  const skills = withSkills ? files.filter((file) => file.startsWith("skills/")).map(copy) : [];
  const plugin: Copy[] =
    hookNames.length === 0
      ? []
      : [
          {
            to: PLUGIN,
            text: opencodePlugin(fromTarget(target.root, RUNNER), opencodeHooks(hookNames)),
          },
        ];
  // The status line is a TUI plugin of its own: the rows build beside it, and a loader that
  // imports it by path, because the plugin sits in the config directory rather than the package.
  const tuiPlugin: Copy[] = withStatusline
    ? [
        { from: join(packageDir, "dist", "statusline-rows.js"), to: ROWS },
        {
          to: TUI_PLUGIN,
          text: opencodeStatusline(fromTarget(target.root, ROWS), "prompt.footer.status"),
        },
      ]
    : [];
  return [...agents, ...skills, ...runner, ...plugin, ...tuiPlugin];
};
