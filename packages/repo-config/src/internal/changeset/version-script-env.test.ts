import { describe, expect, it } from "vitest";
import { versionScriptEnv } from "@/internal/changeset/version-script-env";

describe("versionScriptEnv", () => {
  it("takes GITHUB_TOKEN from GH_TOKEN when only GH_TOKEN is set", () => {
    expect(versionScriptEnv({ GH_TOKEN: "t", PATH: "/bin" })).toEqual({
      GH_TOKEN: "t",
      GITHUB_TOKEN: "t",
      PATH: "/bin",
    });
  });

  it("keeps a GITHUB_TOKEN that is already set", () => {
    const env = { GH_TOKEN: "t", GITHUB_TOKEN: "own" };
    expect(versionScriptEnv(env)).toBe(env);
  });

  it("treats an empty GITHUB_TOKEN as unset", () => {
    expect(versionScriptEnv({ GH_TOKEN: "t", GITHUB_TOKEN: "" }).GITHUB_TOKEN).toBe("t");
  });

  it("leaves the environment alone without GH_TOKEN", () => {
    const env = { GH_TOKEN: "", PATH: "/bin" };
    expect(versionScriptEnv(env)).toBe(env);
  });
});
