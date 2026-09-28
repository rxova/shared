import { describe, expect, it } from "vitest";
import { sizeProblems } from "@/internal/size/size-problems";

describe("sizeProblems", () => {
  it("reports files over the limit, and allowed files that fit again", () => {
    expect(
      sizeProblems(
        [
          { path: "big.ts", lines: 600 },
          { path: "ok.ts", lines: 500 },
          { path: "legacy.ts", lines: 900 },
          { path: "shrunk.ts", lines: 10 },
        ],
        500,
        ["legacy.ts", "shrunk.ts"],
      ),
    ).toEqual([
      "big.ts: 600 lines (limit 500)",
      "shrunk.ts: 10 lines, within the limit now; remove it from repoConfig.fileSize.allow",
    ]);
  });
});
