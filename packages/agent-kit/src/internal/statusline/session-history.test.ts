import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { sessionHistory } from "@/internal/statusline/session-history";

const roots: string[] = [];
const scratch = () => {
  const root = mkdtempSync(join(tmpdir(), "rx-ai-history-"));
  roots.push(root);
  return root;
};

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const stored = (file: string): unknown => JSON.parse(readFileSync(file, "utf8"));

describe("sessionHistory", () => {
  it("starts a history, creating the directory, and appends each new count", () => {
    const dir = join(scratch(), "nested", "history");
    expect(sessionHistory(dir, "s1", 100)).toEqual([100]);
    expect(sessionHistory(dir, "s1", 250)).toEqual([100, 250]);
    expect(stored(join(dir, "s1.json"))).toEqual([100, 250]);
  });

  it("does not repeat the last count, which is the same turn rendered again", () => {
    const dir = scratch();
    sessionHistory(dir, "s1", 100);
    expect(sessionHistory(dir, "s1", 100)).toEqual([100]);
    expect(sessionHistory(dir, "s1", 200)).toEqual([100, 200]);
    expect(sessionHistory(dir, "s1", 100)).toEqual([100, 200, 100]);
  });

  it("keeps sessions apart", () => {
    const dir = scratch();
    sessionHistory(dir, "one", 1);
    expect(sessionHistory(dir, "two", 2)).toEqual([2]);
  });

  it("keeps only the latest 24 counts", () => {
    const dir = scratch();
    let history: number[] = [];
    for (let tokens = 1; tokens <= 30; tokens += 1) history = sessionHistory(dir, "s", tokens);
    expect(history).toHaveLength(24);
    expect(history[0]).toBe(7);
    expect(history.at(-1)).toBe(30);
    expect(stored(join(dir, "s.json"))).toEqual(history);
  });

  it("strips path characters from the session id so the file stays in the directory", () => {
    const root = scratch();
    const dir = join(root, "history");
    expect(sessionHistory(dir, "../../escape", 5)).toEqual([5]);
    expect(existsSync(join(dir, "escape.json"))).toBe(true);
    expect(existsSync(join(root, "escape.json"))).toBe(false);
  });

  it("records nothing without a usable session id or a token count", () => {
    const dir = join(scratch(), "history");
    expect(sessionHistory(dir, "", 5)).toEqual([5]);
    expect(sessionHistory(dir, "../", 5)).toEqual([5]);
    expect(sessionHistory(dir, "s", undefined)).toEqual([]);
    expect(sessionHistory(dir, "", undefined)).toEqual([]);
    expect(existsSync(dir)).toBe(false);
  });

  it("starts over from a corrupt file and repairs it", () => {
    const dir = scratch();
    writeFileSync(join(dir, "s.json"), "{not json");
    expect(sessionHistory(dir, "s", 10)).toEqual([10]);
    expect(stored(join(dir, "s.json"))).toEqual([10]);
  });

  it("starts over from a file that is not a list, and drops entries that are not numbers", () => {
    const dir = scratch();
    writeFileSync(join(dir, "a.json"), '{"tokens": 3}');
    expect(sessionHistory(dir, "a", 10)).toEqual([10]);
    writeFileSync(join(dir, "b.json"), '[1, "2", null, 3]');
    expect(sessionHistory(dir, "b", 10)).toEqual([1, 3, 10]);
  });

  it("fails open when the history file cannot be read or written", () => {
    const dir = scratch();
    mkdirSync(join(dir, "s.json"));
    expect(sessionHistory(dir, "s", 10)).toEqual([10]);
  });

  it("fails open when the directory cannot be created", () => {
    const blocker = join(scratch(), "a-file");
    writeFileSync(blocker, "");
    expect(sessionHistory(join(blocker, "history"), "s", 10)).toEqual([10]);
  });
});
