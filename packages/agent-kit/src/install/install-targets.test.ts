import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { installCommand } from "@/install/install-command";
import { statusCommand } from "@/install/status-command";
import { uninstallCommand } from "@/install/uninstall-command";
import { scratchEnv, writeTree } from "@/internal/install/install.fixtures";

const roots: string[] = [];
const scratch = () => {
  const made = scratchEnv();
  roots.push(made.root);
  return { ...made, opencode: join(made.env.configHome, "opencode") };
};
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("installing for OpenCode", () => {
  it("writes converted agents, the skills, the runner and a plugin that calls it", () => {
    const { env, opencode, target } = scratch();
    expect(installCommand(["--target", "opencode"], env)).toBe(0);
    const agent = readFileSync(join(opencode, "agents/rx-planner.md"), "utf8");
    expect(agent).toContain("mode: subagent");
    expect(existsSync(join(opencode, "skills/rx-verify/notes/extra.md"))).toBe(true);
    expect(readFileSync(join(opencode, "rx-ai/hooks.js"), "utf8")).toBe("// runner");
    const plugin = readFileSync(join(opencode, "plugins/rx-kit.js"), "utf8");
    expect(plugin).toContain(JSON.stringify(join(opencode, "rx-ai/hooks.js")));
    expect(plugin).toContain('"names":["no-bypass","no-attribution","danger-zone","dev-server"]');
    expect(existsSync(target)).toBe(false);
    expect(env.io.out).toHaveBeenCalledWith(expect.stringContaining("for OpenCode into"));
  });

  it("with both targets, leaves the skills to the Claude Code install, which OpenCode reads", () => {
    const { env, opencode, target } = scratch();
    expect(installCommand(["--target", "both", "--profile", "full"], env)).toBe(0);
    expect(existsSync(join(target, "skills/rx-verify/SKILL.md"))).toBe(true);
    expect(existsSync(join(opencode, "skills"))).toBe(false);
    expect(existsSync(join(opencode, "agents/rx-pitch.md"))).toBe(true);
    expect(existsSync(join(opencode, "plugins/rx-kit.js"))).toBe(true);
    expect(statusCommand([], env)).toBe(0);
  });

  it("updates every installed target on a plain rerun, and uninstalls them all", () => {
    const { env, opencode, target } = scratch();
    installCommand(["--target", "both"], env);
    expect(installCommand(["--add", "rx-pitch"], env)).toBe(0);
    expect(existsSync(join(target, "agents/rx-pitch.md"))).toBe(true);
    expect(existsSync(join(opencode, "agents/rx-pitch.md"))).toBe(true);
    expect(uninstallCommand([], env)).toBe(0);
    expect(existsSync(join(opencode, "agents"))).toBe(false);
    expect(existsSync(join(opencode, "rx-ai"))).toBe(false);
    expect(existsSync(join(target, "agents"))).toBe(false);
  });

  it("writes no plugin when no hook is chosen, and reports edits to generated files", () => {
    const { env, opencode } = scratch();
    installCommand(
      [
        "--target",
        "opencode",
        "--profile",
        "core",
        "--skip",
        "no-bypass,no-attribution,danger-zone,secret-guard,dev-server,config-lock",
      ],
      env,
    );
    expect(existsSync(join(opencode, "plugins"))).toBe(false);
    expect(statusCommand(["--target", "opencode"], env)).toBe(0);
    writeTree(opencode, { "agents/rx-planner.md": "edited" });
    expect(statusCommand(["--target", "opencode"], env)).toBe(1);
    expect(env.io.out).toHaveBeenCalledWith("  changed  agents/rx-planner.md");
  });

  it("installs OpenCode for the project with --project", () => {
    const { env } = scratch();
    expect(installCommand(["--target", "opencode", "--project"], env)).toBe(0);
    expect(existsSync(join(env.cwd, ".opencode/plugins/rx-kit.js"))).toBe(true);
  });

  it("prints the plan per target with --dry-run, and rejects an unknown target", () => {
    const { env, opencode } = scratch();
    expect(installCommand(["--target", "both", "--dry-run"], env)).toBe(0);
    expect(env.io.out).toHaveBeenCalledWith("  write   plugins/rx-kit.js");
    expect(existsSync(opencode)).toBe(false);
    expect(installCommand(["--target", "cursor"], env)).toBe(1);
    expect(uninstallCommand(["--target", "cursor"], env)).toBe(1);
  });

  it("refuses to overwrite a file it did not write in either target", () => {
    const { env, opencode } = scratch();
    writeTree(opencode, { "plugins/rx-kit.js": "mine" });
    expect(installCommand(["--target", "both"], env)).toBe(1);
    expect(env.io.err).toHaveBeenCalledWith(
      expect.stringContaining(join(opencode, "plugins/rx-kit.js")),
    );
  });

  it("reports a target named on the command line that is not installed", () => {
    const { env } = scratch();
    installCommand([], env);
    expect(statusCommand(["--target", "opencode"], env)).toBe(1);
    expect(env.io.out).toHaveBeenCalledWith(expect.stringContaining("not installed in"));
    expect(uninstallCommand(["--target", "opencode", "--dry-run"], env)).toBe(0);
  });
});
