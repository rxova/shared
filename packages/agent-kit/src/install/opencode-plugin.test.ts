import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { opencodeHooks } from "@/install/opencode-hooks";
import { opencodePlugin } from "@/install/opencode-plugin";

// A stand-in for the hook runner: logs every call, blocks --no-verify, reports lint on .ts
// files, and answers the session-start hook.
const dir = mkdtempSync(join(tmpdir(), "rx-kit-plugin-"));
const log = join(dir, "calls.jsonl");
const runner = join(dir, "fake-runner.mjs");
writeFileSync(
  runner,
  `import { appendFileSync, readFileSync } from 'node:fs';
const names = process.argv[2];
const input = JSON.parse(readFileSync(0, 'utf8'));
appendFileSync(${JSON.stringify(log)}, JSON.stringify({ names, input }) + '\\n');
if (names.includes('no-bypass') && String(input.tool_input?.command).includes('--no-verify')) {
  process.stderr.write('rx-ai no-bypass: blocked');
  process.exit(2);
}
if (names.includes('quick-check') && String(input.tool_input?.file_path).endsWith('.ts')) {
  process.stderr.write('rx-ai quick-check: lint problem');
  process.exit(2);
}
if (names.includes('handoff-reminder')) process.stdout.write('read the handoff note');
`,
);
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

type Hook = (input: unknown, output: unknown) => Promise<void>;
const load = async (names: string[]) => {
  const file = join(dir, `plugin-${String(Math.random()).slice(2)}.js`);
  writeFileSync(file, opencodePlugin(runner, opencodeHooks(names)));
  const module = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
  // OpenCode 1 takes every exported function as a plugin, so there must still be exactly one.
  expect(Object.keys(module).filter((key) => typeof module[key] === "function")).toEqual(["RxKit"]);
  const factory = module.RxKit as (context: { directory: string }) => Promise<Record<string, Hook>>;
  return factory({ directory: "/proj" });
};

/** The OpenCode 2 definition from the same file, set up against a host that records its hooks. */
const loadV2 = async (names: string[]) => {
  const file = join(dir, `plugin-v2-${String(Math.random()).slice(2)}.js`);
  writeFileSync(file, opencodePlugin(runner, opencodeHooks(names)));
  const module = (await import(pathToFileURL(file).href)) as {
    default: { id: string; setup: (context: unknown) => Promise<() => Promise<void>> };
  };
  const registered = new Map<string, Hook>();
  let disposed = 0;
  const domain = (prefix: string) => ({
    hook: (name: string, callback: Hook) => {
      registered.set(`${prefix}.${name}`, callback);
      return Promise.resolve({
        dispose: () => {
          disposed += 1;
          return Promise.resolve();
        },
      });
    },
  });
  const cleanup = await module.default.setup({
    location: { directory: "/proj" },
    tool: domain("tool"),
    session: domain("session"),
  });
  return {
    id: module.default.id,
    names: [...registered.keys()],
    disposedCount: () => disposed,
    cleanup,
    fire: async (name: string, input: unknown) => {
      const callback = registered.get(name);
      if (callback === undefined) throw new Error(`the plugin registered no ${name} hook`);
      await callback(input, undefined);
    },
  };
};
/** A hook the plugin returned, or a failure naming the one that is missing. */
const hook = (plugin: Record<string, Hook>, name: string): Hook => {
  const found = plugin[name];
  if (found === undefined) throw new Error(`the plugin has no ${name} hook`);
  return found;
};
const calls = () =>
  readFileSync(log, "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as { names: string; input: Record<string, unknown> });

describe("the OpenCode plugin", () => {
  const all = [
    "no-bypass",
    "danger-zone",
    "config-lock",
    "quick-check",
    "memory-snapshot",
    "handoff-reminder",
    "context-nudge",
  ];

  it("blocks a bash call by throwing the runner’s message, and lets others through", async () => {
    const plugin = await load(all);
    const before = hook(plugin, "tool.execute.before");
    await expect(
      before({ tool: "bash", sessionID: "s1" }, { args: { command: "git push --no-verify" } }),
    ).rejects.toThrow("rx-ai no-bypass: blocked");
    await expect(
      before({ tool: "bash", sessionID: "s1" }, { args: { command: "git status" } }),
    ).resolves.toBeUndefined();
    const last = calls().at(-1);
    expect(last?.names).toBe("no-bypass,danger-zone");
    expect(last?.input).toEqual({
      hook_event_name: "PreToolUse",
      session_id: "s1",
      cwd: "/proj",
      tool_name: "Bash",
      tool_input: { command: "git status" },
    });
  });

  it("turns edit, write and apply_patch arguments into Claude Code inputs, one per patched file", async () => {
    const plugin = await load(all);
    const before = hook(plugin, "tool.execute.before");
    await before(
      { tool: "edit", sessionID: "s" },
      { args: { filePath: "/p/a.ts", oldString: "a", newString: "b" } },
    );
    await before(
      { tool: "write", sessionID: "s" },
      { args: { filePath: "/p/b.ts", content: "c" } },
    );
    await before(
      { tool: "apply_patch", sessionID: "s" },
      {
        args: {
          patchText:
            "*** Begin Patch\n*** Update File: /p/x.ts\n@@\n-old\n+new\n*** Add File: /p/y.ts\n+made\n*** End Patch",
        },
      },
    );
    await before({ tool: "read", sessionID: "s" }, { args: { filePath: "/p/a.ts" } });
    await before({ tool: "apply_patch", sessionID: "s" }, { args: {} });
    const inputs = calls()
      .slice(-4)
      .map(({ names, input }) => [names, input.tool_name, input.tool_input]);
    expect(inputs).toEqual([
      ["config-lock", "Edit", { file_path: "/p/a.ts", old_string: "a", new_string: "b" }],
      ["config-lock", "Write", { file_path: "/p/b.ts", content: "c" }],
      ["config-lock", "Edit", { file_path: "/p/x.ts", new_string: "new\n" }],
      ["config-lock", "Edit", { file_path: "/p/y.ts", new_string: "made\n" }],
    ]);
  });

  it("appends a lint report to the tool output after an edit, and leaves clean output alone", async () => {
    const plugin = await load(all);
    const after = hook(plugin, "tool.execute.after");
    const output = { title: "", output: "Edited", metadata: {} };
    await after(
      { tool: "edit", sessionID: "s", args: { filePath: "/p/a.ts", newString: "x" } },
      output,
    );
    expect(output.output).toBe("Edited\n\nrx-ai quick-check: lint problem");
    const clean = { title: "", output: "Edited", metadata: {} };
    await after(
      { tool: "edit", sessionID: "s", args: { filePath: "/p/a.md", newString: "x" } },
      clean,
    );
    expect(clean.output).toBe("Edited");
    await after({ tool: "bash", sessionID: "s", args: { command: "ls" } }, clean);
    expect(calls().some(({ names }) => names.includes("context-nudge"))).toBe(false);
  });

  it("snapshots on compaction, and adds the session-start reminder to the system prompt once", async () => {
    const plugin = await load(all);
    await hook(plugin, "experimental.session.compacting")({ sessionID: "s9" }, { context: [] });
    expect(calls().at(-1)).toEqual({
      names: "memory-snapshot",
      input: { hook_event_name: "PreCompact", session_id: "s9", cwd: "/proj" },
    });
    const event = plugin.event as (payload: unknown) => Promise<void>;
    await event({ event: { type: "session.created", properties: { info: { id: "s9" } } } });
    await event({
      event: { type: "session.created", properties: { info: { id: "child", parentID: "s9" } } },
    });
    await event({ event: { type: "session.idle", properties: {} } });
    const transform = hook(plugin, "experimental.chat.system.transform");
    const system = { system: ["base"] };
    await transform({ sessionID: "s9" }, system);
    await transform({ sessionID: "s9" }, system);
    await transform({}, system);
    expect(system.system).toEqual(["base", "read the handoff note"]);
  });

  it("runs nothing, and fails open, when no hook is chosen or the runner cannot start", async () => {
    const empty = await load([]);
    await expect(
      hook(empty, "tool.execute.before")(
        { tool: "bash", sessionID: "s" },
        { args: { command: "git push --no-verify" } },
      ),
    ).resolves.toBeUndefined();
    const file = join(dir, "broken.js");
    writeFileSync(file, opencodePlugin(join(dir, "missing-runner.mjs"), opencodeHooks(all)));
    const broken = (await import(pathToFileURL(file).href)) as {
      RxKit: (c: { directory: string }) => Promise<Record<string, Hook>>;
    };
    const plugin = await broken.RxKit({ directory: "/proj" });
    await expect(
      hook(plugin, "tool.execute.before")(
        { tool: "bash", sessionID: "s" },
        { args: { command: "git push --no-verify" } },
      ),
    ).resolves.toBeUndefined();
  });
  describe("as an OpenCode 2 plugin", () => {
    it("is a definition the version 2 loader takes", async () => {
      const v2 = await loadV2(all);
      expect(v2.id).toBe("rx-kit");
      expect(v2.names).toEqual([
        "tool.execute.before",
        "tool.execute.after",
        "session.compaction",
        "session.context",
      ]);
    });

    it("blocks a tool call the hooks refuse", async () => {
      const v2 = await loadV2(["no-bypass"]);
      await expect(
        v2.fire("tool.execute.before", {
          tool: "bash",
          sessionID: "s1",
          input: { command: "git push --no-verify" },
        }),
      ).rejects.toThrow(/no-bypass/);
    });

    it("appends a hook's report to the tool's output", async () => {
      const v2 = await loadV2(["quick-check"]);
      const input = {
        tool: "write",
        sessionID: "s1",
        status: "completed",
        input: { filePath: "/proj/a.ts", content: "x" },
        result: { content: "wrote it" },
      };
      await v2.fire("tool.execute.after", input);
      expect(input.result.content).toBe("wrote it\n\nrx-ai quick-check: lint problem");
    });

    it("leaves a failed tool call's result alone", async () => {
      const v2 = await loadV2(["quick-check"]);
      const input = {
        tool: "write",
        sessionID: "s1",
        status: "error",
        input: { filePath: "/proj/a.ts", content: "x" },
        error: { message: "boom" },
      };
      await expect(v2.fire("tool.execute.after", input)).resolves.toBeUndefined();
    });

    it("adds the session-start reminder to the system prompt once", async () => {
      const v2 = await loadV2(["handoff-reminder"]);
      const first = { sessionID: "s1", system: [] as string[] };
      await v2.fire("session.context", first);
      expect(first.system).toEqual(["read the handoff note"]);
      const second = { sessionID: "s1", system: [] as string[] };
      await v2.fire("session.context", second);
      expect(second.system).toEqual([]);
    });

    it("tells the hooks a compaction is coming", async () => {
      const v2 = await loadV2(["memory-snapshot"]);
      await v2.fire("session.compaction", { sessionID: "s1", system: [] });
      expect(calls().some(({ input }) => input.hook_event_name === "PreCompact")).toBe(true);
    });

    it("unregisters every hook when OpenCode tears it down", async () => {
      const v2 = await loadV2(all);
      await v2.cleanup();
      expect(v2.disposedCount()).toBe(4);
    });
  });
});
