import { describe, expect, it } from "vitest";
import { describePackages } from "@/internal/publish/describe-packages";

describe("describePackages", () => {
  it("joins name@version pairs", () => {
    expect(
      describePackages([
        { name: "a", version: "1" },
        { name: "b", version: "2" },
      ]),
    ).toBe("a@1, b@2");
  });
});
