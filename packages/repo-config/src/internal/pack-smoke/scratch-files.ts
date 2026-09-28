import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ScratchFiles } from "@/pack-smoke/pack-smoke.types";

/** A throwaway directory under the OS temp dir, and the file access pack-smoke needs in it. */
export const scratchFiles: ScratchFiles = {
  make: () => mkdtempSync(join(tmpdir(), "pack-smoke-")),
  list: (dir) => readdirSync(dir),
  read: (file) => readFileSync(file, "utf8"),
  write: (file, contents) => {
    writeFileSync(file, contents);
  },
  remove: (dir) => {
    rmSync(dir, { recursive: true, force: true });
  },
};
