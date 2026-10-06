import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Tool } from "@/init/init.types";
import { formatFiles } from "@/internal/init/format-files";

describe("formatFiles", () => {
  let log: string[];
  beforeEach(() => {
    log = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => log.push(line));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes exactly the given files to prettier", () => {
    const calls: string[] = [];
    const run: Tool = (command, args) => {
      calls.push([command, ...args].join(" "));
      return "";
    };
    formatFiles(run, "/repo", ["README.md", ".changeset/idea-start.md"], false);
    expect(calls).toEqual([
      "pnpm -C /repo exec prettier --write --ignore-unknown README.md .changeset/idea-start.md",
    ]);
    expect(log).toEqual(["init: formatted 2 file(s)"]);
  });

  it("prints a notice and carries on when prettier cannot run", () => {
    const run: Tool = () => {
      throw new Error("Command failed: prettier not found");
    };
    expect(() => {
      formatFiles(run, "/repo", ["README.md"], false);
    }).not.toThrow();
    expect(log).toEqual([
      "init: could not run prettier on 1 file(s); format them before you commit",
    ]);
  });

  it("only counts the files on a dry run", () => {
    const run = vi.fn<Tool>();
    formatFiles(run, "/repo", ["README.md", "docs.md"], true);
    expect(run).not.toHaveBeenCalled();
    expect(log).toEqual(["init: would format 2 file(s)"]);
  });

  it("does nothing without files", () => {
    const run = vi.fn<Tool>();
    formatFiles(run, "/repo", [], false);
    expect(run).not.toHaveBeenCalled();
    expect(log).toEqual([]);
  });
});
