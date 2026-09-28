import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { llmsTermFailures } from "@/internal/llms/llms-term-failures";

const root = mkdtempSync(join(tmpdir(), "llms-terms-"));
writeFileSync(
  join(root, "types.ts"),
  "export const RULE_IDS = ['TEST_REMOVED', 'TEST_SKIPPED_ADDED'] as const;\n",
);

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("llmsTermFailures", () => {
  it("checks nothing without terms", () => {
    expect(llmsTermFailures(root, "anything")).toEqual([]);
  });

  it("reports each required term that is missing", () => {
    expect(
      llmsTermFailures(root, "run overlock check", {
        requiredTerms: ["overlock check", "overlock init"],
      }),
    ).toEqual(['llms.txt does not mention "overlock init"']);
  });

  it("reports missing ids and stale id-shaped names", () => {
    const config = { idsFrom: "types.ts#RULE_IDS", idPattern: "\\b[A-Z][A-Z_]{6,}\\b" };
    expect(llmsTermFailures(root, "TEST_REMOVED TEST_SKIPPED_ADDED", config)).toEqual([]);
    expect(llmsTermFailures(root, "no ids here", { idPattern: "\\bRULE_[A-Z]+\\b" })).toEqual([]);
    expect(llmsTermFailures(root, "TEST_REMOVED and TEST_RENAMED, TEST_RENAMED", config)).toEqual([
      "llms.txt does not mention TEST_SKIPPED_ADDED",
      "llms.txt names TEST_RENAMED, which is not one of the ids in types.ts#RULE_IDS",
    ]);
  });
});
