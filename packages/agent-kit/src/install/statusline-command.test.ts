import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { installCommand } from "@/install/install-command";
import { statuslineCommand } from "@/install/statusline-command";
import { scratchEnv } from "@/internal/install/install.fixtures";

const roots: string[] = [];
const scratch = () => {
  const made = scratchEnv();
  roots.push(made.root);
  return made;
};
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
const json = (path: string) => JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;

describe("statuslineCommand", () => {
  it("installs only the status line where the kit is not installed, and removes it all again", () => {
    const { env, target } = scratch();
    expect(statuslineCommand([], env)).toBe(0);
    expect(existsSync(join(target, "rx-ai/statusline.js"))).toBe(true);
    expect(existsSync(join(target, "rx-ai/hooks.js"))).toBe(false);
    expect(existsSync(join(target, "agents"))).toBe(false);
    expect(existsSync(join(target, "skills"))).toBe(false);
    const settings = json(join(target, "settings.json"));
    expect(settings.hooks).toBeUndefined();
    expect(JSON.stringify(settings.statusLine)).toContain("statusline.js");
    expect(json(join(target, "rx-ai/manifest.json"))).toMatchObject({ profile: "none", items: [] });

    expect(statuslineCommand(["--remove"], env)).toBe(0);
    expect(existsSync(join(target, "rx-ai"))).toBe(false);
    expect(existsSync(join(target, "settings.json"))).toBe(false);
  });

  it("keeps an existing install's selection, and --remove leaves that install in place", () => {
    const { env, target } = scratch();
    installCommand([], env);
    expect(statuslineCommand([], env)).toBe(0);
    expect(json(join(target, "rx-ai/manifest.json"))).toMatchObject({
      profile: "core",
      statusline: true,
    });
    expect(existsSync(join(target, "agents/rx-planner.md"))).toBe(true);

    expect(statuslineCommand(["--remove"], env)).toBe(0);
    expect(json(join(target, "settings.json")).statusLine).toBeUndefined();
    expect(existsSync(join(target, "rx-ai/statusline.js"))).toBe(false);
    expect(existsSync(join(target, "agents/rx-planner.md"))).toBe(true);
  });

  it("works in the project with --project, and writes nothing with --dry-run", () => {
    const { env } = scratch();
    expect(statuslineCommand(["--project", "--dry-run"], env)).toBe(0);
    expect(env.io.out).toHaveBeenCalledWith("  write   rx-ai/statusline.js");
    expect(existsSync(join(env.cwd, ".claude"))).toBe(false);
    expect(statuslineCommand(["--project"], env)).toBe(0);
    expect(existsSync(join(env.cwd, ".claude/rx-ai/statusline.js"))).toBe(true);
    expect(statuslineCommand(["--project", "--remove", "--dry-run"], env)).toBe(0);
    expect(existsSync(join(env.cwd, ".claude/rx-ai/statusline.js"))).toBe(true);
  });

  it("replaces someone else's status line only with --force", () => {
    const { env, target } = scratch();
    const settings = join(target, "settings.json");
    mkdirSync(target, { recursive: true });
    writeFileSync(
      settings,
      JSON.stringify({ statusLine: { type: "command", command: "mine.sh" } }),
    );
    expect(statuslineCommand([], env)).toBe(1);
    expect(statuslineCommand(["--force"], env)).toBe(0);
    expect(JSON.stringify(json(settings).statusLine)).toContain("statusline.js");
  });

  it("stops on an unknown option", () => {
    const { env } = scratch();
    expect(statuslineCommand(["--profile", "core"], env)).toBe(1);
    expect(env.io.err).toHaveBeenCalledWith(expect.stringContaining("rxova-agent-kit statusline:"));
  });
  it("draws it in OpenCode when that target is named", () => {
    const { env, opencode, target } = scratch();
    expect(statuslineCommand(["--target", "opencode"], env)).toBe(0);
    expect(existsSync(join(opencode, "plugin/rx-statusline/index.js"))).toBe(true);
    expect(json(join(opencode, "cli.json")).plugins).toEqual([
      pathToFileURL(join(opencode, "plugin", "rx-statusline")).href,
    ]);
    expect(existsSync(join(target, "rx-ai/statusline.js"))).toBe(false);
  });
  it("installs nothing but the status line into a target the kit has never been in", () => {
    const { env, opencode, target } = scratch();
    // The kit is in Claude Code; OpenCode has never had it.
    expect(installCommand(["--profile", "full"], env)).toBe(0);
    expect(statuslineCommand(["--target", "opencode"], env)).toBe(0);
    const manifest = json(join(opencode, "rx-ai/manifest.json"));
    expect(manifest.profile).toBe("none");
    expect(manifest.items).toEqual([]);
    // One target's manifest must not decide another's: `core` here would be agents and skills
    // nobody asked for.
    expect(existsSync(join(opencode, "agents"))).toBe(false);
    expect(existsSync(join(opencode, "skills"))).toBe(false);
    expect(existsSync(join(opencode, "plugin/rx-statusline/index.js"))).toBe(true);
    // The Claude install keeps everything it had.
    expect(json(join(target, "rx-ai/manifest.json")).profile).toBe("full");
  });

  it("keeps each target's own selection when both are named", () => {
    const { env, opencode, target } = scratch();
    expect(installCommand(["--target", "claude", "--profile", "full"], env)).toBe(0);
    expect(statuslineCommand(["--target", "both"], env)).toBe(0);
    expect(json(join(target, "rx-ai/manifest.json")).profile).toBe("full");
    expect(json(join(opencode, "rx-ai/manifest.json")).profile).toBe("none");
  });
  it("says the status line is on, rather than only naming what it kept", () => {
    const { env } = scratch();
    expect(statuslineCommand([], env)).toBe(0);
    expect(env.io.out).toHaveBeenCalledWith(expect.stringContaining("with the status line"));
  });
});
