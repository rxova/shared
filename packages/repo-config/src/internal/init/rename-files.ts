import { join } from "node:path";
import type { Reader } from "@/config/config.types";
import type { Rename } from "@/init/init.types";
import { renameText } from "@/internal/init/rename-text";

/**
 * Applies the renames to each text file and writes the ones that changed.
 * A file holding a NUL byte is binary and left alone. Returns the changed paths.
 */
export const renameFiles = (
  root: string,
  files: readonly string[],
  renames: readonly Rename[],
  { read, write }: { read: Reader; write: (file: string, contents: string) => void },
): string[] =>
  files.filter((file) => {
    const before = read(join(root, file));
    if (before === undefined || before.includes("\0")) return false;
    const after = renameText(before, renames);
    if (after === before) return false;
    write(join(root, file), after);
    return true;
  });
