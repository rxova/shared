import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { idsFromSource } from "@/internal/llms/ids-from-source";

const root = mkdtempSync(join(tmpdir(), "ids-from-source-"));
writeFileSync(
  join(root, "types.ts"),
  [
    'import x from "y";',
    "let [destructured] = [1];",
    "export const RULE_IDS = ['TEST_REMOVED', `ASSERTION_REMOVED`] as const;",
    "export const CODES = ['A'] satisfies readonly string[];",
    'export const MIXED = ["A", 1];',
    'export const NOT_ARRAY = "A";',
  ].join("\n"),
);

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("idsFromSource", () => {
  it("reads the strings of an as-const or satisfies array", () => {
    expect(idsFromSource(root, "types.ts#RULE_IDS")).toEqual(["TEST_REMOVED", "ASSERTION_REMOVED"]);
    expect(idsFromSource(root, "types.ts#CODES")).toEqual(["A"]);
  });

  it.each([
    ["missing.ts#X", "missing.ts does not exist"],
    ["types.ts#NOPE", "declares no array of strings named NOPE"],
    ["types.ts#NOT_ARRAY", "declares no array of strings named NOT_ARRAY"],
    ["types.ts#MIXED", "MIXED in types.ts holds something other than strings"],
  ])("refuses %s", (reference, message) => {
    expect(() => idsFromSource(root, reference)).toThrow(message);
  });
});
