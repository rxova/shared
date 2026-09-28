import { parseArgs } from 'node:util';

/** The options the commands take; each command allows a subset. */
export interface Options {
  project?: boolean;
  'dry-run'?: boolean;
  force?: boolean;
  profile?: string;
  add?: string[];
  skip?: string[];
}

type Name = keyof Options;

/**
 * The command's options, allowing only `allowed`. `--add` and `--skip` may repeat and take
 * comma-separated lists. Throws on anything else, with Node's message naming the argument.
 */
export const parseOptions = (argv: readonly string[], allowed: readonly Name[]): Options => {
  const every = {
    project: { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    force: { type: 'boolean' },
    profile: { type: 'string' },
    add: { type: 'string', multiple: true },
    skip: { type: 'string', multiple: true },
  } as const;
  const options = Object.fromEntries(allowed.map((name) => [name, every[name]]));
  const { values } = parseArgs({ args: [...argv], options, strict: true, allowPositionals: false });
  const parsed = values as Options;
  const split = (list: string[] | undefined) =>
    list
      ?.flatMap((entry) => entry.split(','))
      .map((name) => name.trim())
      .filter((name) => name !== '');
  const add = split(parsed.add);
  const skip = split(parsed.skip);
  return { ...parsed, ...(add && { add }), ...(skip && { skip }) };
};
