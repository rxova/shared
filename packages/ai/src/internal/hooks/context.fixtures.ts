import type { HookContext, HookInput, RunResult } from '@/hooks/hook.types';

/** A Bash tool call running `command`. */
export const bash = (
  command: string,
  cwd = '/repo',
  extra: Record<string, unknown> = {},
): HookInput => ({
  tool_name: 'Bash',
  tool_input: { command, ...extra },
  cwd,
});

/**
 * A context over an in-memory file system holding `files` (absolute path → text). `run` answers
 * from `programs`, keyed by `program arg arg…`; anything else fails to start. Writes land in
 * `files`, so a test can read them back.
 */
export const contextWith = ({
  files = {},
  programs = {},
  env = {},
  now = new Date('2026-09-28T12:00:00Z'),
  platform = 'linux',
}: {
  files?: Record<string, string>;
  programs?: Record<string, Partial<RunResult>>;
  env?: Record<string, string>;
  now?: Date;
  platform?: NodeJS.Platform;
} = {}): HookContext & { files: Record<string, string>; ran: string[] } => {
  const ran: string[] = [];
  return {
    files,
    ran,
    exists: (path) =>
      Object.hasOwn(files, path) || Object.keys(files).some((file) => file.startsWith(`${path}/`)),
    read: (path) => (Object.hasOwn(files, path) ? files[path] : undefined),
    write: (path, text) => {
      files[path] = text;
    },
    remove: (path) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- the fake file system is a plain record
      delete files[path];
    },
    list: (dir) =>
      Object.keys(files)
        .filter((file) => file.startsWith(`${dir}/`) && !file.slice(dir.length + 1).includes('/'))
        .map((file) => file.slice(dir.length + 1)),
    run: (program, args) => {
      const key = [program, ...args].join(' ');
      ran.push(key);
      const answer = programs[key];
      return answer === undefined
        ? { status: null, stdout: '', stderr: '' }
        : { status: 0, stdout: '', stderr: '', ...answer };
    },
    env,
    now: () => now,
    platform,
    stateDir: '/state',
  };
};
