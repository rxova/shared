import { describe, expect, it } from "vitest";
import { versionPrBody } from "@/internal/changeset/version-pr-body";

describe("versionPrBody", () => {
  it("lists each package whose version moved, by name", () => {
    expect(
      versionPrBody(
        { b: "1.0.0", a: "0.1.0", same: "2.0.0", gone: "1.0.0" },
        { b: "1.1.0", a: "1.0.0", same: "2.0.0", added: "0.0.1" },
      ),
    ).toBe(
      [
        "Merging this pull request versions these packages:",
        "",
        "- a: 0.1.0 → 1.0.0",
        "- b: 1.0.0 → 1.1.0",
      ].join("\n"),
    );
  });

  it("keeps the headline when nothing moved", () => {
    expect(versionPrBody({ a: "1.0.0" }, { a: "1.0.0" })).toBe(
      "Merging this pull request versions these packages:\n",
    );
  });
});
