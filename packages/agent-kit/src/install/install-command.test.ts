import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { installCommand } from "@/install/install-command";
import { scratchEnv, writeTree } from "@/internal/install/install.fixtures";

const roots: string[] = [];
const scratch = (version?: string) => {
  const made = scratchEnv(version);
  roots.push(made.root);
  return made;
};
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
const json = (path: string) => JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
const commands = (target: string) => JSON.stringify(json(join(target, "settings.json")));

describe("installCommand", () => {
  it("installs the core profile by default: its content, the runner, its hooks and a manifest", () => {
    const { env, target } = scratch();
    expect(installCommand([], env)).toBe(0);
    expect(readFileSync(join(target, "agents/rx-planner.md"), "utf8")).toContain("plans");
    expect(readFileSync(join(target, "skills/rx-verify/notes/extra.md"), "utf8")).toBe("extra");
    expect(readFileSync(join(target, "rx-ai/hooks.js"), "utf8")).toBe("// runner");
    expect(existsSync(join(target, "agents/rx-pitch.md"))).toBe(false);
    const manifest = json(join(target, "rx-ai/manifest.json"));
    expect(manifest).toMatchObject({ version: "1.0.0", profile: "core" });
    expect(manifest.items).toEqual(
      expect.arrayContaining(["rx-planner", "rx-verify", "no-bypass", "danger-zone"]),
    );
    expect(manifest.items).not.toContain("quick-check");
    expect(commands(target)).toContain("no-bypass");
    expect(commands(target)).not.toContain("quick-check");
    expect(env.io.out).toHaveBeenCalledWith(
      expect.stringContaining("core: 1 agents, 1 skills, 6 hooks"),
    );
  });

  it("installs a named profile, with items added and skipped", () => {
    const { env, target } = scratch();
    expect(installCommand(["--profile", "hackathon", "--skip", "rx-demo,context-nudge"], env)).toBe(
      0,
    );
    expect(existsSync(join(target, "agents/rx-pitch.md"))).toBe(true);
    expect(existsSync(join(target, "skills/rx-demo"))).toBe(false);
    const settings = commands(target);
    for (const hook of ["quick-check", "memory-snapshot", "handoff-reminder"])
      expect(settings).toContain(hook);
    expect(settings).not.toContain("context-nudge");
    expect(json(join(target, "settings.json"))).toMatchObject({
      hooks: {
        PreCompact: [expect.anything()],
        SessionEnd: [expect.anything()],
        SessionStart: [expect.anything()],
      },
    });
  });

  it("keeps the last selection on a plain rerun, and --add extends it", () => {
    const { env, target } = scratch();
    installCommand(["--profile", "core", "--add", "rx-pitch"], env);
    installCommand([], env);
    expect(json(join(target, "rx-ai/manifest.json")).items).toContain("rx-pitch");
    installCommand(["--add=rx-demo"], env);
    expect(existsSync(join(target, "skills/rx-demo/SKILL.md"))).toBe(true);
  });

  it("keeps the settings it did not write, and does not duplicate its hooks on a rerun", () => {
    const { env, target } = scratch();
    const other = { matcher: "Bash", hooks: [{ type: "command", command: "mine.sh" }] };
    writeTree(target, {
      "settings.json": JSON.stringify({ model: "x", hooks: { PreToolUse: [other] } }),
    });
    installCommand([], env);
    installCommand([], env);
    const settings = json(join(target, "settings.json"));
    expect(settings.model).toBe("x");
    const pre = (settings.hooks as Record<string, unknown[]>).PreToolUse ?? [];
    expect(pre[0]).toEqual(other);
    expect(pre).toHaveLength(3);
  });

  it("refuses to install without a home directory", () => {
    const { env } = scratch();
    expect(installCommand([], { ...env, home: "" })).toBe(1);
    expect(env.io.err).toHaveBeenCalledWith(expect.stringContaining("HOME is empty"));
  });

  it("installs into the project with --project", () => {
    const { env } = scratch();
    expect(installCommand(["--project"], env)).toBe(0);
    expect(existsSync(join(env.cwd, ".claude/agents/rx-planner.md"))).toBe(true);
  });

  it("refuses to overwrite files it did not write, unless forced", () => {
    const { env, target } = scratch();
    writeTree(target, { "agents/rx-planner.md": "someone else" });
    expect(installCommand([], env)).toBe(1);
    expect(env.io.err).toHaveBeenCalledWith(
      expect.stringContaining(join("agents", "rx-planner.md")),
    );
    expect(readFileSync(join(target, "agents/rx-planner.md"), "utf8")).toBe("someone else");
    expect(installCommand(["--force"], env)).toBe(0);
    expect(readFileSync(join(target, "agents/rx-planner.md"), "utf8")).toContain("plans");
  });

  it("removes what a narrower selection no longer includes", () => {
    const { env, target } = scratch();
    installCommand(["--profile", "full"], env);
    expect(installCommand(["--profile", "core"], env)).toBe(0);
    expect(existsSync(join(target, "agents/rx-pitch.md"))).toBe(false);
    expect(existsSync(join(target, "skills/rx-demo"))).toBe(false);
  });

  it("prints the plan and writes nothing with --dry-run", () => {
    const { env, target } = scratch();
    installCommand(["--profile", "full"], env);
    expect(installCommand(["--profile", "core", "--dry-run"], env)).toBe(0);
    expect(env.io.out).toHaveBeenCalledWith("  remove  agents/rx-pitch.md");
    expect(env.io.out).toHaveBeenCalledWith("  write   agents/rx-planner.md");
    expect(existsSync(join(target, "agents/rx-pitch.md"))).toBe(true);
  });

  it("sets the status line with --statusline, keeps it on a rerun, and drops it with --no-statusline", () => {
    const { env, target } = scratch();
    expect(installCommand(["--statusline"], env)).toBe(0);
    expect(readFileSync(join(target, "rx-ai/statusline.sh"), "utf8")).toBe("# status line");
    const script = join(target, "rx-ai", "statusline.sh");
    expect(json(join(target, "settings.json")).statusLine).toEqual({
      type: "command",
      command: `bash "${script}"`,
    });
    expect(json(join(target, "rx-ai/manifest.json")).statusline).toBe(true);
    installCommand([], env);
    expect(json(join(target, "settings.json")).statusLine).toBeDefined();
    expect(installCommand(["--no-statusline"], env)).toBe(0);
    expect(json(join(target, "settings.json")).statusLine).toBeUndefined();
    expect(existsSync(script)).toBe(false);
  });

  it("leaves the status line alone without --statusline", () => {
    const { env, target } = scratch();
    installCommand([], env);
    expect(json(join(target, "settings.json")).statusLine).toBeUndefined();
    expect(existsSync(join(target, "rx-ai/statusline.sh"))).toBe(false);
  });

  it("refuses to replace someone else's status line, unless forced", () => {
    const { env, target } = scratch();
    const theirs = { type: "command", command: "bash ~/mine.sh" };
    writeTree(target, { "settings.json": JSON.stringify({ statusLine: theirs }) });
    expect(installCommand(["--statusline"], env)).toBe(1);
    expect(env.io.err).toHaveBeenCalledWith(expect.stringContaining("(statusLine)"));
    expect(json(join(target, "settings.json")).statusLine).toEqual(theirs);
    installCommand([], env);
    expect(json(join(target, "settings.json")).statusLine).toEqual(theirs);
    expect(installCommand(["--statusline", "--force"], env)).toBe(0);
    expect(JSON.stringify(json(join(target, "settings.json")).statusLine)).toContain(
      "statusline.sh",
    );
  });

  it("says it will set the status line in a dry run", () => {
    const { env } = scratch();
    expect(installCommand(["--statusline", "--dry-run"], env)).toBe(0);
    expect(env.io.out).toHaveBeenCalledWith("  write   rx-ai/statusline.sh");
    expect(env.io.out).toHaveBeenCalledWith(
      "  update  settings.json (the rx-ai hooks and status line)",
    );
  });

  it("stops on bad options, unknown names, an unbuilt package or unreadable settings", () => {
    const { env, target } = scratch();
    expect(installCommand(["--nope"], env)).toBe(1);
    expect(installCommand(["--profile", "huge"], env)).toBe(1);
    expect(env.io.err).toHaveBeenLastCalledWith(expect.stringContaining("unknown profile"));
    expect(installCommand(["--add", "rx-nothing"], env)).toBe(1);
    expect(env.io.err).toHaveBeenLastCalledWith(expect.stringContaining("rxova-agent-kit list"));
    writeTree(target, { "settings.json": "{ not json" });
    expect(installCommand([], env)).toBe(1);
    expect(env.io.err).toHaveBeenLastCalledWith(expect.stringContaining("not valid JSON"));
    writeFileSync(join(target, "settings.json"), "[]");
    expect(installCommand([], env)).toBe(1);
    rmSync(join(env.packageDir, "dist/hooks.js"));
    expect(installCommand([], env)).toBe(1);
    expect(env.io.err).toHaveBeenLastCalledWith(expect.stringContaining("build the package"));
  });
});
