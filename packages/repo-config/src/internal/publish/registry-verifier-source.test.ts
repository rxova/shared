import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { registryVerifierSource } from "@/internal/publish/registry-verifier-source";

const root = mkdtempSync(join(tmpdir(), "registry-verifier-"));
const install = (name: string, version: string, source: string) => {
  const dir = join(root, "node_modules", ...name.split("/"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name, version, main: "index.cjs" }));
  writeFileSync(join(dir, "index.cjs"), source);
};
install("@x/full", "1.0.0", "exports.a = 1;");
install("empty", "2.0.0", "");

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

const run = (published: object[], importable: object[]) => {
  writeFileSync(
    join(root, "verify.mjs"),
    registryVerifierSource(published as never, importable as never),
  );
  return execFileSync(process.execPath, ["verify.mjs"], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
  });
};

describe("registryVerifierSource", () => {
  it("checks the installed versions and loads the importable packages", () => {
    const out = run(
      [
        { name: "@x/full", version: "1.0.0" },
        { name: "empty", version: "2.0.0" },
      ],
      [{ name: "@x/full", version: "1.0.0" }],
    );
    expect(out).toContain("ok @x/full@1.0.0 installed");
    expect(out).toContain("ok @x/full loads through import and require");
  });

  it("fails a version mismatch and a package that exports nothing", () => {
    expect(() => run([{ name: "empty", version: "9.0.0" }], [])).toThrow(
      /expected 9\.0\.0, installed 2\.0\.0/,
    );
    expect(() => run([], [{ name: "empty", version: "2.0.0" }])).toThrow(
      /empty exposes no exports/,
    );
  });
});
