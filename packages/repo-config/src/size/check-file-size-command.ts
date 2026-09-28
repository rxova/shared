import { readFile } from "@/internal/config/read-file";
import { countLines } from "@/internal/size/count-lines";
import { gitLsFiles } from "@/internal/size/git-ls-files";
import { sizeProblems } from "@/internal/size/size-problems";
import type { Reader } from "@/config/config.types";
import { join } from "node:path";
import { readConfig } from "@/config/read-config";

/**
 * `rxova-repo-config check-file-size`: no tracked source file grows past
 * `repoConfig.fileSize.max` lines (500). Checked extensions are
 * `fileSize.extensions`, file names in `fileSize.ignore` (`pnpm-lock.yaml`)
 * are skipped, and `fileSize.allow` lists the files over the limit today —
 * a list that only shrinks, since an allowed file back under the limit fails
 * too. Returns the process exit code.
 */
export const checkFileSizeCommand = ({
  root = process.cwd(),
  list = gitLsFiles,
  read = readFile,
}: { root?: string; list?: (root: string) => string[]; read?: Reader } = {}): number => {
  try {
    const {
      max = 500,
      extensions = ["ts", "tsx", "js", "mjs", "cjs", "astro", "css", "yaml", "yml", "json"],
      ignore = ["pnpm-lock.yaml"],
      allow = [],
    } = readConfig(root, read).fileSize ?? {};
    const files = list(root)
      .filter((path) => extensions.some((extension) => path.endsWith(`.${extension}`)))
      .filter((path) => !ignore.includes(path.slice(path.lastIndexOf("/") + 1)))
      .flatMap((path) => {
        const text = read(join(root, path));
        return text === undefined ? [] : [{ path, lines: countLines(text) }];
      });
    const problems = sizeProblems(files, max, allow);
    if (problems.length > 0) {
      console.error(
        [
          "check-file-size: split these files or shrink the allow list:",
          ...problems.map((p) => `  ${p}`),
        ].join("\n"),
      );
      return 1;
    }
    console.log(`check-file-size: ${String(files.length)} file(s) within ${String(max)} lines`);
    return 0;
  } catch (failure) {
    console.error(`check-file-size failed — ${(failure as Error).message}`);
    return 1;
  }
};
