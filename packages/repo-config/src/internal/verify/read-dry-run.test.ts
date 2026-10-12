import { describe, expect, it } from "vitest";
import { readDryRun } from "@/internal/verify/read-dry-run";

const node = `"${process.execPath}" -e`;

describe("readDryRun", () => {
  it("appends --dry=json and returns what the command printed", () => {
    expect(readDryRun(`${node} "console.log(process.argv.at(-1))" --`)).toBe("--dry=json\n");
  });

  it("throws when the command fails", () => {
    expect(() => readDryRun(`${node} "process.exit(3)" --`)).toThrow();
  });
});
