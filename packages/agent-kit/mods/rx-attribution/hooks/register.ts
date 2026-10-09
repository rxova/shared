import type { EngineInterface, Register } from "claude-code";

import { attributionLines } from "./attribution-lines";
import { commits } from "./commits";
import { gitDir } from "./git-dir";
import { opensOrEditsPr } from "./opens-or-edits-pr";
import { prUrl } from "./pr-url";
import { withoutAttribution } from "./without-attribution";

/**
 * Reads a pull request's body and, when it credits Claude, removes those lines with gh pr edit
 * (or only reports them when `isFixing` is off). Answers the note for the model, if any.
 */
const checkPr = async (
  $: EngineInterface,
  url: string,
  isFixing: boolean,
): Promise<string | undefined> => {
  const view = await $.process.run(["gh", "pr", "view", url, "--json", "body", "-q", ".body"]);
  if (view.exitCode !== 0) {
    return `rx-attribution: could not read ${url} to check its body (${view.stderr.trim()}).`;
  }

  const found = attributionLines(view.stdout);
  if (found.length === 0) {
    return undefined;
  }

  if (!isFixing) {
    return `rx-attribution: ${url} carries attribution: ${found.join(" | ")}. Remove it with gh pr edit.`;
  }

  const edit = await $.process.run(["gh", "pr", "edit", url, "--body-file", "-"], {
    stdin: withoutAttribution(view.stdout),
  });
  if (edit.exitCode !== 0) {
    return `rx-attribution: ${url} carries attribution (${found.join(" | ")}) and gh pr edit failed: ${edit.stderr.trim()}`;
  }

  $.ui.toast(`rx-attribution: removed ${found.length} attribution line(s) from ${url}`);

  return `rx-attribution: removed attribution from ${url}'s body: ${found.join(" | ")}.`;
};

/**
 * Reads the newest commit and answers a note for the model when its author or committer is not
 * `email` (an empty `email` skips that) or its message credits Claude.
 */
const checkCommit = async (
  $: EngineInterface,
  cwd: string | undefined,
  email: string,
): Promise<string | undefined> => {
  const log = await $.process.run(
    ["git", "log", "-1", "--pretty=%an <%ae>%n%cn <%ce>%n%B"],
    cwd === undefined ? undefined : { cwd },
  );
  if (log.exitCode !== 0) {
    return undefined;
  }

  const [author = "", committer = "", ...message] = log.stdout.split("\n");
  const problems: string[] = [];
  if (email !== "" && !author.endsWith(`<${email}>`)) {
    problems.push(`author is ${author}`);
  }
  if (email !== "" && !committer.endsWith(`<${email}>`)) {
    problems.push(`committer is ${committer}`);
  }
  const found = attributionLines(message.join("\n"));
  if (found.length > 0) {
    problems.push(`message carries ${found.join(" | ")}`);
  }

  return problems.length === 0
    ? undefined
    : `rx-attribution: the new commit is wrong: ${problems.join("; ")}. Amend it before pushing.`;
};

export const register: Register = (on, options) => {
  const email = typeof options.authorEmail === "string" ? options.authorEmail.trim() : "";
  const isFixing = options.fixPrBody !== false;

  on("attribution.text", { kind: "commit" }, () => ({ text: "" }));
  on("attribution.text", { kind: "pr" }, () => ({ text: "" }));

  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    const ran = await next(e);
    if (ran.deny !== undefined || ran.isError === true) {
      return ran;
    }

    const notes: string[] = [];
    if (opensOrEditsPr(e.command)) {
      const url = prUrl(ran.text ?? "");
      const note = url === undefined ? undefined : await checkPr($, url, isFixing);
      if (note !== undefined) notes.push(note);
    }
    if (commits(e.command)) {
      const note = await checkCommit($, gitDir(e.command), email);
      if (note !== undefined) notes.push(note);
    }

    return notes.length === 0 ? ran : { ...ran, context: [...(ran.context ?? []), ...notes] };
  }).catch(($, e, next) => next(e));
};
