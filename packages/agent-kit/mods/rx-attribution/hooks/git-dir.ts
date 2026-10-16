const COMMIT = /\bgit\s+((?:-[cC]\s+("[^"]+"|'[^']+'|\S+)\s+)*)commit\b/;
const CD = /(?:^|[;&|(\n])\s*cd\s+("[^"]+"|'[^']+'|[^\s;&|)]+)/g;
const GIT_C = /-C\s+("[^"]+"|'[^']+'|\S+)/g;

const unquote = (word: string): string => word.replace(/^["']|["']$/g, "");

/** A directory a shell can't be read for without running it: a variable, `~`, `cd -`. */
const isOpaque = (dir: string): boolean => /[$`]/.test(dir) || dir.startsWith("~") || dir === "-";

/**
 * The directory a shell command runs git commit in: every `cd <dir>` before the commit, in turn
 * (a relative one goes onto the one before it), then the commit's own `git -C <dir>`. Undefined
 * when there is neither (the session's own directory); null when a step can't be read without
 * running the shell (`cd "$W"`, `cd ~/x`, `cd -`), so the caller doesn't read some other HEAD.
 */
export const gitDir = (command: string): string | null | undefined => {
  const commit = COMMIT.exec(command);
  if (commit === null) {
    return undefined;
  }

  const steps = [
    ...[...command.slice(0, commit.index).matchAll(CD)].map((match) => match[1] ?? ""),
    ...[...(commit[1] ?? "").matchAll(GIT_C)].map((match) => match[1] ?? ""),
  ].map(unquote);

  let dir: string | undefined;
  for (const step of steps) {
    if (isOpaque(step)) {
      return null;
    }
    dir = step.startsWith("/") || dir === undefined ? step : `${dir.replace(/\/+$/, "")}/${step}`;
  }

  return dir;
};
