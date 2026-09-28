import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { memoryScratch, SCRATCH } from "@/internal/pack-smoke/memory-scratch.fixtures";
import { runFixtures } from "@/internal/pack-smoke/fixture-runs";

describe("runFixtures", () => {
  const run = {
    bin: "rxova-codemod",
    args: ["input-otp-to-otp", "fixture.tsx"],
    fixture: { path: "fixture.tsx", contents: "import { OTPInput } from 'input-otp'" },
    expect: ["from '@rxova/react-otp-input'", "OtpInput"],
  };

  it("writes the fixture, runs the bin and checks the rewritten file", () => {
    const { fs, files } = memoryScratch({});
    const output = vi.fn(() => {
      files.set(join(SCRATCH, "fixture.tsx"), "import { OtpInput } from '@rxova/react-otp-input'");
      return "";
    });
    runFixtures([run], { output, fs, scratch: SCRATCH });
    expect(output).toHaveBeenCalledWith(
      "npx",
      ["--no-install", "rxova-codemod", "input-otp-to-otp", "fixture.tsx"],
      SCRATCH,
    );
  });

  it("names what the fixture or the output is missing", () => {
    const { fs } = memoryScratch({});
    expect(() => {
      runFixtures([run], { output: () => "", fs, scratch: SCRATCH });
    }).toThrow(
      '`rxova-codemod input-otp-to-otp fixture.tsx` left fixture.tsx without "from \'@rxova/react-otp-input\'", "OtpInput"',
    );
    expect(() => {
      runFixtures([{ bin: "x", args: [], expect: ["done"] }], {
        output: () => "fail",
        fs,
        scratch: SCRATCH,
      });
    }).toThrow('`x` left its output without "done"');
    expect(() => {
      runFixtures([{ bin: "x", args: [], expect: ["done"] }], {
        output: () => "done",
        fs,
        scratch: SCRATCH,
      });
    }).not.toThrow();
  });
});
