import { parseArgs } from "node:util";

/** The options the commands take; each command allows a subset. */
export interface Options {
  project?: boolean;
  "dry-run"?: boolean;
  force?: boolean;
  statusline?: boolean;
  profile?: string;
  target?: string;
  add?: string[];
  skip?: string[];
}

type Name = keyof Options;

/**
 * The command's options, allowing only `allowed`. `--add` and `--skip` may repeat and take
 * comma-separated lists, and a boolean may be turned off with `--no-<name>`. Throws on anything else, with Node's message naming the argument.
 */
export const parseOptions = (argv: readonly string[], allowed: readonly Name[]): Options => {
  const every = {
    project: { type: "boolean" },
    "dry-run": { type: "boolean" },
    force: { type: "boolean" },
    statusline: { type: "boolean" },
    profile: { type: "string" },
    target: { type: "string" },
    add: { type: "string", multiple: true },
    skip: { type: "string", multiple: true },
  } as const;
  const options = Object.fromEntries(allowed.map((name) => [name, every[name]]));
  const { values } = parseArgs({
    args: [...argv],
    options,
    strict: true,
    allowPositionals: false,
    allowNegative: true,
  });
  const parsed = values as Options;
  const split = (list: string[] | undefined) =>
    list
      ?.flatMap((entry) => entry.split(","))
      .map((name) => name.trim())
      .filter((name) => name !== "");
  const add = split(parsed.add);
  const skip = split(parsed.skip);
  return { ...parsed, ...(add && { add }), ...(skip && { skip }) };
};
