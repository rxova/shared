import { describe, expect, it } from "vitest";
import { assertOnlyKeys } from "@/internal/config/assert-only-keys";

describe("assertOnlyKeys", () => {
  it("accepts the allowed keys, in any subset", () => {
    expect(() => {
      assertOnlyKeys({ verify: {} }, "repoConfig", ["verify", "changeset"]);
      assertOnlyKeys({}, "repoConfig", ["verify"]);
    }).not.toThrow();
  });

  it("names an unknown key and the keys it could have been", () => {
    expect(() => {
      assertOnlyKeys({ verfy: {} }, "repoConfig", ["verify", "changeset"]);
    }).toThrow(
      'package.json#repoConfig has an unknown key "verfy"; expected one of verify, changeset',
    );
  });
});
