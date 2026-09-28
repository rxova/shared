import type { Shell } from "@/pack-smoke/pack-smoke.types";
import {
  fakeNpm,
  HEALTHY_TARBALL,
  memoryScratch,
  PARENT,
  SCRATCH,
} from "@/internal/pack-smoke/memory-scratch.fixtures";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { packSmoke } from "@/pack-smoke/pack-smoke";

describe("packSmoke", () => {
  it("packs, installs, imports, and cleans up", () => {
    const { fs, files, removed } = memoryScratch({ name: "@scope/example", version: "0.1.0" });
    const calls: string[] = [];
    const sh: Shell = (command, args, cwd) => {
      calls.push(`${command} ${args[0] ?? ""} @ ${cwd}`);
      return fakeNpm()(command, args, cwd);
    };

    expect(packSmoke({ pkgDir: "/pkg", sh, fs })).toBe(
      "pack:smoke ok — @scope/example@0.1.0 installs, imports and requires from a tarball",
    );
    expect(calls).toEqual([
      "npm pack @ /pkg",
      `tar -tzf @ ${SCRATCH}`,
      `npm install @ ${SCRATCH}`,
      `node ${join(SCRATCH, "probe.mjs")} @ ${SCRATCH}`,
    ]);
    expect(files.get(join(SCRATCH, "probe.mjs"))).toContain("@scope/example");
    expect(removed).toEqual([SCRATCH]);
  });

  it("resolves workspace dependencies before installing", () => {
    const manifest = {
      name: "@scope/example",
      version: "0.1.0",
      dependencies: { "@scope/core": "workspace:^" },
    };
    const { fs } = memoryScratch(manifest, {
      extra: {
        [join(SCRATCH, "package", "package.json")]: JSON.stringify(manifest),
        [join("/", "core", "package.json")]: JSON.stringify({ name: "@scope/core" }),
      },
    });
    const listed = fs.list;
    fs.list = (dir) => (dir === PARENT ? ["core", "pkg"] : listed(dir));
    const sh: Shell = (command, args, cwd) =>
      args.includes("--json")
        ? JSON.stringify([{ filename: "scope-core-0.0.0.tgz" }])
        : fakeNpm()(command, args, cwd);

    expect(packSmoke({ pkgDir: "/pkg", sh, fs })).toContain("@scope/example@0.1.0 installs");
  });

  it("runs every bin the package declares", () => {
    const { fs } = memoryScratch({
      name: "tool",
      version: "1.2.3",
      bin: { tool: "./dist/cli.js" },
    });
    const sh = vi.fn(fakeNpm({ contents: [...HEALTHY_TARBALL, "package/dist/cli.js"] }));
    packSmoke({ pkgDir: "/pkg", sh, fs });
    expect(sh).toHaveBeenCalledWith("npx", ["--no-install", "tool", "--version"], SCRATCH);
  });

  it("fails when npm pack wrote no tarball, and still cleans up", () => {
    const { fs, removed } = memoryScratch({ name: "x", version: "1.0.0" }, { tarball: false });
    expect(() => packSmoke({ pkgDir: "/pkg", sh: fakeNpm(), fs })).toThrow("produced no tarball");
    expect(removed).toEqual([SCRATCH]);
  });

  it("fails when the installed package is missing a shipped file", () => {
    const { fs, removed } = memoryScratch({
      name: "x",
      version: "1.0.0",
      files: ["dist", "schema.json"],
    });
    const sh = fakeNpm({ contents: ["package/README.md", "package/dist/index.js"] });
    expect(() => packSmoke({ pkgDir: "/pkg", sh, fs })).toThrow(
      "the tarball does not contain LICENSE, schema.json",
    );
    expect(removed).toEqual([SCRATCH]);
  });

  it("finds nested and glob `files` entries in the tarball", () => {
    const { fs } = memoryScratch({
      name: "x",
      version: "1.0.0",
      files: ["assets/logo.svg", "dist", "schemas/*.json"],
    });
    const sh = fakeNpm({
      contents: [...HEALTHY_TARBALL, "package/assets/logo.svg", "package/schemas/config.json"],
    });
    expect(packSmoke({ pkgDir: "/pkg", sh, fs })).toContain("x@1.0.0 installs");
    expect(() => packSmoke({ pkgDir: "/pkg", sh: fakeNpm(), fs })).toThrow(
      "the tarball does not contain assets/logo.svg, schemas/*.json",
    );
  });

  it("installs a workspace peer beside the package, from its own tarball", () => {
    const manifest = {
      name: "@scope/react",
      version: "0.1.0",
      peerDependencies: { "@scope/core": "workspace:^", react: ">=18" },
    };
    const { fs } = memoryScratch(manifest, {
      extra: {
        [join(SCRATCH, "package", "package.json")]: JSON.stringify(manifest),
        [join("/", "core", "package.json")]: JSON.stringify({
          name: "@scope/core",
          version: "1.2.0",
        }),
      },
    });
    const listed = fs.list;
    fs.list = (dir) => (dir === PARENT ? ["core", "pkg"] : listed(dir));
    const installs: string[][] = [];
    const sh: Shell = (command, args, cwd) => {
      if (args[0] === "install") installs.push(args);
      return args.includes("--json")
        ? JSON.stringify([{ filename: "scope-core-1.2.0.tgz" }])
        : fakeNpm()(command, args, cwd);
    };

    expect(packSmoke({ pkgDir: "/pkg", sh, fs })).toContain("@scope/react@0.1.0 installs");
    expect(installs).toEqual([
      [
        "install",
        "--no-audit",
        "--no-fund",
        join(SCRATCH, "scope-example-0.1.0.tgz"),
        join(SCRATCH, "scope-core-1.2.0.tgz"),
      ],
    ]);
  });

  it("fails when a file the exports map points at is not in the tarball", () => {
    const { fs } = memoryScratch({
      name: "x",
      version: "1.0.0",
      exports: {
        ".": {
          types: { import: "./dist/index.d.ts", require: "./dist/index.d.cts" },
          import: "./dist/index.js",
          require: "./dist/index.cjs",
        },
      },
    });
    const sh = fakeNpm({ contents: [...HEALTHY_TARBALL, "package/dist/index.d.ts"] });
    expect(() => packSmoke({ pkgDir: "/pkg", sh, fs })).toThrow(
      "the tarball does not contain dist/index.d.cts, dist/index.cjs",
    );
  });

  it("fails when the tarball ships sources or tests nobody listed", () => {
    const { fs, removed } = memoryScratch({ name: "x", version: "1.0.0", files: ["dist"] });
    const sh = fakeNpm({
      contents: [...HEALTHY_TARBALL, "package/src/index.ts", "package/dist/index.test.js"],
    });
    expect(() => packSmoke({ pkgDir: "/pkg", sh, fs })).toThrow(
      "the tarball ships sources or tests: src/index.ts, dist/index.test.js",
    );
    expect(removed).toEqual([SCRATCH]);
  });

  it("ships sources a `files` entry names on purpose", () => {
    const { fs } = memoryScratch({ name: "x", version: "1.0.0", files: ["dist", "src"] });
    const sh = fakeNpm({ contents: [...HEALTHY_TARBALL, "package/src/index.ts"] });
    expect(packSmoke({ pkgDir: "/pkg", sh, fs })).toContain("x@1.0.0 installs");
  });

  it("fails when a built entry lost the source's 'use client' directive", () => {
    const manifest = {
      name: "x",
      version: "1.0.0",
      exports: { "./client": { import: "./dist/client.js", require: "./dist/client.cjs" } },
    };
    const installed = join(SCRATCH, "node_modules", "x", "dist");
    const contents = [...HEALTHY_TARBALL, "package/dist/client.js", "package/dist/client.cjs"];
    const { fs } = memoryScratch(manifest, {
      extra: {
        [join("/pkg", "src", "client.ts")]: "'use client';\nexport const a = 1;\n",
        [join(installed, "client.js")]: '"use client";export const a=1;',
        [join(installed, "client.cjs")]: '"use strict";exports.a=1;',
      },
    });
    expect(() => packSmoke({ pkgDir: "/pkg", sh: fakeNpm({ contents }), fs })).toThrow(
      "lost the 'use client' directive: dist/client.cjs (from src/client.ts)",
    );
    fs.write(join(installed, "client.cjs"), '"use strict";"use client";exports.a=1;');
    expect(packSmoke({ pkgDir: "/pkg", sh: fakeNpm({ contents }), fs })).toContain("installs");
  });

  it("fails when a bin prints something that is not a version", () => {
    const { fs } = memoryScratch({ name: "tool", version: "1.0.0", bin: "./cli.js" });
    expect(() =>
      packSmoke({
        pkgDir: "/pkg",
        sh: fakeNpm({
          version: "command not found",
          contents: [...HEALTHY_TARBALL, "package/cli.js"],
        }),
        fs,
      }),
    ).toThrow("unusable version");
  });

  it("fails when the probe does not print ok", () => {
    const { fs } = memoryScratch({ name: "x", version: "1.0.0" });
    expect(() => packSmoke({ pkgDir: "/pkg", sh: fakeNpm({ probe: "boom" }), fs })).toThrow(
      "probe failed: boom",
    );
  });

  it("tolerates a manifest without a name or a version", () => {
    const { fs } = memoryScratch({});
    expect(packSmoke({ pkgDir: "/pkg", sh: fakeNpm(), fs })).toBe(
      "pack:smoke ok — @ installs, imports and requires from a tarball",
    );
  });
});
