import { describe, expect, it } from "vitest";
import { changesetFileName } from "@/internal/changeset/changeset-file-name";

describe("changesetFileName", () => {
  it("names the file after the package and the time", () => {
    expect(changesetFileName("@rxova/Journey-Core", 36)).toBe("rxova-journey-core-10.md");
    expect(changesetFileName("use-everywhere", 0)).toBe("use-everywhere-0.md");
  });
});
