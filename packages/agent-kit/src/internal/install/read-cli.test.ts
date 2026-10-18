import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { readCli } from "@/internal/install/read-cli";

const dir = mkdtempSync(join(tmpdir(), "rx-read-cli-"));
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("readCli", () => {
  it("is empty where there is no cli.json", () => {
    expect(readCli(join(dir, "missing"))).toEqual({});
  });

  it("reads the config as an object", () => {
    writeFileSync(join(dir, "cli.json"), JSON.stringify({ plugins: ["a"], theme: "dark" }));
    expect(readCli(dir)).toEqual({ plugins: ["a"], theme: "dark" });
  });

  it("is empty for a cli.json holding something other than an object", () => {
    writeFileSync(join(dir, "cli.json"), JSON.stringify(["a"]));
    expect(readCli(dir)).toEqual({});
    writeFileSync(join(dir, "cli.json"), '"text"');
    expect(readCli(dir)).toEqual({});
  });
});
