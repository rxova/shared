import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { opencodeStatusline } from "@/install/opencode-statusline";

// OpenCode resolves the host modules for a plugin it loads, so the generated file names them as
// bare imports. Here they are stubs in the scratch directory's own node_modules.
const dir = mkdtempSync(join(tmpdir(), "rx-statusline-"));
const stub = (name: string, subpath: string, source: string) => {
  const root = join(dir, "node_modules", ...name.split("/"));
  mkdirSync(root, { recursive: true });
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ name, type: "module", exports: { [`./${subpath}`]: `./${subpath}.js` } }),
  );
  writeFileSync(join(root, `${subpath}.js`), source);
};
stub("@opencode/plugin", "tui", "export const Plugin = { define: (definition) => definition };");
stub("@opentui/solid", "jsx-runtime", "export const jsx = (type, props) => ({ type, props });");
const solid = join(dir, "node_modules", "solid-js");
mkdirSync(solid, { recursive: true });
writeFileSync(
  join(solid, "package.json"),
  JSON.stringify({ name: "solid-js", type: "module", main: "index.js" }),
);
writeFileSync(
  join(solid, "index.js"),
  `export const createSignal = (initial) => {
     let value = initial;
     return [() => value, (next) => { value = typeof next === 'function' ? next(value) : next; }];
   };`,
);
const rows = join(dir, "rows.js");
writeFileSync(
  rows,
  `export const opencodeFacts = (session) => ({ session, now: 0, columns: 80, mode: 'none', history: [] });
   export const opencodeRows = (session) => [
     [{ text: session.model ?? 'none', fg: '#cba6f7', bold: true }],
     [{ text: 'link', fg: '#74c7ec', bold: false, href: 'https://x.test' }],
   ];`,
);
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

const load = async (slot = "prompt.footer.status") => {
  const file = join(dir, `plugin-${String(Math.random()).slice(2)}.js`);
  writeFileSync(file, opencodeStatusline(rows, slot));
  const module = (await import(pathToFileURL(file).href)) as { default: unknown };
  return module.default as {
    id: string;
    setup: (context: unknown) => () => void;
  };
};

const context = () => {
  const handlers: string[] = [];
  const claims: { append: string; render: (input: unknown) => unknown }[] = [];
  let stopped = 0;
  return {
    stopped: () => stopped,
    handlers,
    claims,
    value: {
      location: { directory: "/w" },
      renderer: { width: 100 },
      data: {
        on: (type: string) => {
          handlers.push(type);
          return () => {
            stopped += 1;
          };
        },
        location: { default: () => ({ directory: "/w" }) },
        session: {
          get: () => ({
            model: { name: "gpt-5", limit: { context: 200_000 } },
            time: { created: 0 },
          }),
          cost: () => 1,
          message: { list: () => [{ tokens: { input: 10 } }] },
        },
      },
      ui: {
        slot: (claim: { append: string; render: (input: unknown) => unknown }) => {
          claims.push(claim);
        },
      },
    },
  };
};

describe("opencodeStatusline", () => {
  it("is a plugin OpenCode can load, named for the kit", async () => {
    expect((await load()).id).toBe("rx-statusline");
  });

  it("claims the slot it was installed for", async () => {
    const host = context();
    (await load("home.footer.status")).setup(host.value);
    expect(host.claims).toHaveLength(1);
    expect(host.claims[0]?.append).toBe("home.footer.status");
  });

  it("repaints on usage, idle, model and finished turns, and on nothing else", async () => {
    const host = context();
    (await load()).setup(host.value);
    expect(host.handlers).toEqual([
      "session.usage.updated",
      "session.idle",
      "session.model.selected",
      "session.execution.succeeded",
      "session.execution.failed",
      "session.execution.interrupted",
    ]);
  });

  it("draws one text per row, with a span per cell", async () => {
    const host = context();
    (await load()).setup(host.value);
    const tree = host.claims[0]?.render({ sessionID: "s1" }) as {
      type: string;
      props: { children: { type: string; props: { children: { type: string }[] } }[] };
    };
    expect(tree.type).toBe("box");
    expect(tree.props.children).toHaveLength(2);
    expect(tree.props.children[0]?.type).toBe("text");
    expect(tree.props.children[0]?.props.children[0]?.type).toBe("span");
  });

  it("draws a cell carrying a link as a link, not a span", async () => {
    const host = context();
    (await load()).setup(host.value);
    const tree = host.claims[0]?.render({ sessionID: "s1" }) as {
      props: { children: { props: { children: { type: string; props: { href?: string } }[] } }[] };
    };
    const linked = tree.props.children[1]?.props.children[0];
    expect(linked?.type).toBe("a");
    expect(linked?.props.href).toBe("https://x.test");
  });

  it("renders before any session exists", async () => {
    const host = context();
    (await load()).setup(host.value);
    expect(() => host.claims[0]?.render(undefined)).not.toThrow();
  });

  it("unsubscribes every handler when OpenCode tears it down", async () => {
    const host = context();
    const cleanup = (await load()).setup(host.value);
    cleanup();
    expect(host.stopped()).toBe(6);
  });
});
