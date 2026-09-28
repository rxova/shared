import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { declaredProps } from "@/internal/llms/declared-props";

describe("declaredProps", () => {
  it("collects property names from interfaces and type literals", () => {
    const dir = mkdtempSync(join(tmpdir(), "declared-props-"));
    try {
      const file = join(dir, "types.ts");
      writeFileSync(
        file,
        [
          'export interface OtpProps { value: string; onChange(v: string): void; "aria-label"?: string }',
          "export type Slot = { index: number; [key: string]: unknown };",
          'type Computed = { [k in "a"]: 1 };',
          'interface Keyed { ["computed"]: string; 3: number }',
        ].join("\n"),
      );
      expect([...declaredProps(file)].sort()).toEqual(["aria-label", "index", "value"]);
      expect(declaredProps(join(dir, "missing.ts")).size).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
