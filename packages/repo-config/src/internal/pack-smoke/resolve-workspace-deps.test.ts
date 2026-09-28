import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { PackageManifest } from "@/manifest/manifest.types";
import {
  fakeNpm,
  memoryScratch,
  PARENT,
  SCRATCH,
} from "@/internal/pack-smoke/memory-scratch.fixtures";
import type { Shell } from "@/pack-smoke/pack-smoke.types";
import { resolveWorkspaceDeps } from "@/internal/pack-smoke/resolve-workspace-deps";

const TARBALL = join(SCRATCH, "scope-example-0.1.0.tgz");

describe("resolveWorkspaceDeps", () => {
  it("does nothing for a package without workspace dependencies", () => {
    const { fs } = memoryScratch({ name: "x", version: "1.0.0", dependencies: { zod: "^4" } });
    const sh = vi.fn(fakeNpm());
    expect(
      resolveWorkspaceDeps("/pkg", { name: "x", dependencies: { zod: "^4" } }, TARBALL, SCRATCH, {
        sh,
        fs,
      }),
    ).toEqual([]);
    expect(sh).not.toHaveBeenCalled();
    resolveWorkspaceDeps("/pkg", { name: "x" }, TARBALL, SCRATCH, { sh, fs });
    expect(sh).not.toHaveBeenCalled();
  });

  it("packs each workspace dependency and repacks the package pointing at it", () => {
    const manifest = {
      name: "@scope/example",
      version: "0.1.0",
      dependencies: { "@scope/core": "workspace:^", zod: "^4.0.0" },
    };
    const { fs, files } = memoryScratch(manifest, {
      extra: {
        [join(SCRATCH, "package", "package.json")]: JSON.stringify(manifest),
        [join("/", "core", "package.json")]: JSON.stringify({ name: "@scope/core" }),
      },
    });
    const listed = fs.list;
    fs.list = (dir) => (dir === PARENT ? ["core", "pkg"] : listed(dir));
    const calls: string[] = [];
    const sh: Shell = (command, args, cwd) => {
      calls.push(`${command} ${args.join(" ")} @ ${cwd}`);
      return args.includes("--json")
        ? JSON.stringify([{ filename: "scope-core-0.0.0.tgz" }])
        : fakeNpm()(command, args, cwd);
    };

    expect(resolveWorkspaceDeps("/pkg", manifest, TARBALL, SCRATCH, { sh, fs })).toEqual([]);

    expect(calls).toEqual([
      `tar -xzf ${TARBALL} -C ${SCRATCH} @ ${SCRATCH}`,
      `npm pack --ignore-scripts --json --pack-destination ${SCRATCH} @ ${join("/", "core")}`,
      `npm pack --ignore-scripts --pack-destination ${SCRATCH} @ ${join(SCRATCH, "package")}`,
    ]);
    const repacked = JSON.parse(
      files.get(join(SCRATCH, "package", "package.json")) ?? "",
    ) as PackageManifest;
    expect(repacked.dependencies).toEqual({
      "@scope/core": `file:${join(SCRATCH, "scope-core-0.0.0.tgz")}`,
      zod: "^4.0.0",
    });
  });

  it("resolves workspace peers and optional dependencies the way pnpm publish would", () => {
    const manifest = {
      name: "@scope/react",
      version: "0.1.0",
      dependencies: { zod: "^4.0.0" },
      optionalDependencies: { "@scope/native": "workspace:*" },
      peerDependencies: { "@scope/core": "workspace:^", react: ">=18" },
      devDependencies: { "@scope/tooling": "workspace:*" },
    };
    const { fs, files } = memoryScratch(manifest, {
      extra: {
        [join(SCRATCH, "package", "package.json")]: JSON.stringify(manifest),
        [join("/", "core", "package.json")]: JSON.stringify({
          name: "@scope/core",
          version: "1.2.0",
        }),
        [join("/", "native", "package.json")]: JSON.stringify({
          name: "@scope/native",
          version: "0.3.0",
        }),
      },
    });
    const listed = fs.list;
    fs.list = (dir) => (dir === PARENT ? ["core", "native", "pkg"] : listed(dir));
    const sh: Shell = (command, args, cwd) =>
      args.includes("--json")
        ? JSON.stringify([{ filename: `${cwd.slice(1)}.tgz` }])
        : fakeNpm()(command, args, cwd);

    expect(resolveWorkspaceDeps("/pkg", manifest, TARBALL, SCRATCH, { sh, fs })).toEqual([
      join(SCRATCH, "core.tgz"),
    ]);
    const repacked = JSON.parse(
      files.get(join(SCRATCH, "package", "package.json")) ?? "",
    ) as PackageManifest & { devDependencies?: Record<string, string> };
    expect(repacked.dependencies).toEqual({ zod: "^4.0.0" });
    expect(repacked.optionalDependencies).toEqual({
      "@scope/native": `file:${join(SCRATCH, "native.tgz")}`,
    });
    expect(repacked.peerDependencies).toEqual({ "@scope/core": "^1.2.0", react: ">=18" });
    expect(repacked.devDependencies).toEqual({ "@scope/tooling": "workspace:*" });
  });
});
