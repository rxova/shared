import type { GuardFiles, HookInput } from '@/hooks/guard.types';

/** A Bash tool call running `command`. */
export const bash = (command: string, cwd = '/repo'): HookInput => ({
  tool_name: 'Bash',
  tool_input: { command },
  cwd,
});

/** A file system holding exactly `contents`, by absolute path. */
export const filesWith = (contents: Record<string, string> = {}): GuardFiles => ({
  exists: (path) => Object.hasOwn(contents, path),
  read: (path) => (Object.hasOwn(contents, path) ? contents[path] : undefined),
});
