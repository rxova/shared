import { describe, expect, it } from "vitest";
import { highestUpdateType } from "@/internal/dependabot/highest-update-type";

describe("highestUpdateType", () => {
  it("picks major over minor over patch", () => {
    expect(highestUpdateType(["patch", "major", "minor"])).toBe("major");
    expect(highestUpdateType(["patch", "minor", "patch"])).toBe("minor");
    expect(highestUpdateType(["patch"])).toBe("patch");
  });

  it("has no answer for no updates", () => {
    expect(highestUpdateType([])).toBeUndefined();
  });
});
