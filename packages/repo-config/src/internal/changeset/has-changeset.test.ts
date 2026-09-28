import { describe, expect, it } from "vitest";
import { hasChangeset } from "@/internal/changeset/has-changeset";

describe("hasChangeset", () => {
  it("recognises a changeset", () => {
    expect(hasChangeset([".changeset/tidy-pandas-smile.md"])).toBe(true);
  });

  it.each([".changeset/README.md", ".changeset/config.json", "docs/changeset.md"])(
    "does not accept %s",
    (file) => {
      expect(hasChangeset([file])).toBe(false);
    },
  );
});
