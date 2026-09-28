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
 * A path in one form whatever the platform: forward slashes and no drive letter, so the tests'
 * POSIX paths match what `node:path` builds on Windows (`C:\\repo\\a` and `/repo/a` are one file).
 */
const canonical = (path: string): string =>
  path.replace(/^[A-Za-z]:(?=[\\/])/, '').replaceAll('\\', '/');

/**
 * A context over an in-memory file system holding `files` (absolute path → text). `run` answers
 * from `programs`, keyed by `program arg arg…`; anything else fails to start. Writes land in
 * `files`, so a test can read them back. Paths are compared in one canonical form, so the tests
 * pass on Windows too.
 */
export const contextWith = ({
  files: given = {},
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
  const files: Record<string, string> = Object.fromEntries(
    Object.entries(given).map(([path, text]) => [canonical(path), text]),
  );
  const ran: string[] = [];
  return {
    files,
    ran,
    exists: (path) => {
      const key = canonical(path);
      return (
        Object.hasOwn(files, key) || Object.keys(files).some((file) => file.startsWith(`${key}/`))
      );
    },
    read: (path) => {
      const key = canonical(path);
      return Object.hasOwn(files, key) ? files[key] : undefined;
    },
    write: (path, text) => {
      files[canonical(path)] = text;
    },
    remove: (path) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- the fake file system is a plain record
      delete files[canonical(path)];
    },
    list: (dir) => {
      const key = canonical(dir);
      return Object.keys(files)
        .filter((file) => file.startsWith(`${key}/`) && !file.slice(key.length + 1).includes('/'))
        .map((file) => file.slice(key.length + 1));
    },
    run: (program, args) => {
      const command = [program, ...args].map(canonical).join(' ');
      ran.push(command);
      const answer = programs[command];
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
