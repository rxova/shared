import { describe, expect, it, vi } from "vitest";
import { runBinChecks } from "@/internal/pack-smoke/bin-checks";

const deps = (printed = "", version = "1.2.3\n") => ({
  sh: vi.fn(() => version),
  output: vi.fn(() => printed),
  scratch: "/scratch",
});

describe("runBinChecks", () => {
  it("checks --version for a bin without a configured check", () => {
    const d = deps();
    runBinChecks(["tool"], undefined, d);
    expect(d.sh).toHaveBeenCalledWith("npx", ["--no-install", "tool", "--version"], "/scratch");
    expect(() => {
      runBinChecks(["tool"], {}, deps("", "oops"));
    }).toThrow("bin `tool` reported an unusable version: oops");
  });

  it("runs a configured check through the combined output", () => {
    const d = deps("Usage: rxova-codemod\n  input-otp-to-otp\n");
    runBinChecks(
      ["rxova-codemod"],
      { "rxova-codemod": { args: ["--help"], expect: "input-otp-to-otp" } },
      d,
    );
    expect(d.output).toHaveBeenCalledWith(
      "npx",
      ["--no-install", "rxova-codemod", "--help"],
      "/scratch",
    );
    expect(d.sh).not.toHaveBeenCalled();
  });

  it("fails a configured check whose text is missing, or with no version when none is named", () => {
    expect(() => {
      runBinChecks(["c"], { c: { args: ["--help"], expect: "x" } }, deps("nothing"));
    }).toThrow('bin `c --help` did not print "x": nothing');
    expect(() => {
      runBinChecks(["c"], { c: { args: ["-V"] } }, deps("none"));
    }).toThrow("bin `c -V` did not print a version");
    expect(() => {
      runBinChecks(["c"], { c: { args: ["-V"] } }, deps("c v2.0.1"));
    }).not.toThrow();
  });

  it("runs nothing with false, and refuses a check for a bin the package lacks", () => {
    const d = deps();
    runBinChecks(["tool"], false, d);
    expect(d.sh).not.toHaveBeenCalled();
    expect(() => {
      runBinChecks(["tool"], { other: { args: [] } }, d);
    }).toThrow("names other, which the package does not install");
  });
});
