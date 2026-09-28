import { describe, expect, it } from "vitest";
import { parsePackageConfig } from "@/config/parse-package-config";

describe("parsePackageConfig", () => {
  it("is empty when the field is absent", () => {
    expect(parsePackageConfig(undefined)).toEqual({});
  });

  it("reads packSmoke, llms and exports", () => {
    const config = {
      packSmoke: { load: "never" },
      llms: { api: "none", requiredTerms: ["/r/otp-field.json"] },
      exports: { profile: "esm-only" },
    };
    expect(parsePackageConfig(config)).toEqual(config);
    expect(parsePackageConfig({ exports: {} })).toEqual({ exports: {} });
  });

  it.each([
    ["x", "package.json#repoConfig must be an object"],
    [{ verify: {} }, 'unknown key "verify"'],
    [{ llms: { entries: "subpaths" } }, 'unknown key "entries"'],
    [{ exports: { profile: 1 } }, "repoConfig.exports.profile must be a non-empty string"],
  ])("rejects %j", (raw, message) => {
    expect(() => parsePackageConfig(raw)).toThrow(message);
  });
});
