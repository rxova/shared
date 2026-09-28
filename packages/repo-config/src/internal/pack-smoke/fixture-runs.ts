import { join } from "node:path";
import type { FixtureRun } from "@/config/config.types";
import type { ScratchFiles, Shell } from "@/pack-smoke/pack-smoke.types";

/**
 * Runs each configured bin against the scratch project the way a user would:
 * writes its fixture, runs `npx --no-install <bin> <args>`, and checks that
 * the fixture afterwards (or, with no fixture, the output) holds every
 * `expect` substring — a codemod rewriting a TSX file from the installed
 * tarball, say. Throws on the first run that falls short.
 */
export const runFixtures = (
  runs: readonly FixtureRun[],
  { output, fs, scratch }: { output: Shell; fs: ScratchFiles; scratch: string },
): void => {
  for (const { bin, args, fixture, expect } of runs) {
    if (fixture !== undefined) fs.write(join(scratch, fixture.path), fixture.contents);
    const printed = output("npx", ["--no-install", bin, ...args], scratch);
    const result = fixture === undefined ? printed : fs.read(join(scratch, fixture.path));
    const missing = expect.filter((text) => !result.includes(text));
    if (missing.length > 0) {
      throw new Error(
        `\`${[bin, ...args].join(" ")}\` left ${fixture?.path ?? "its output"} without ${missing.map((text) => `"${text}"`).join(", ")}`,
      );
    }
  }
};
