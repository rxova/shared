import { basename, resolve } from 'node:path';
import type { Guard } from '@/hooks/guard.types';
import { allow } from '@/internal/hooks/allow';
import { EDITING_TOOLS } from '@/internal/hooks/editing-tools';
import { isConfigFile } from '@/internal/hooks/is-config-file';

/**
 * Stops edits to a lint, format, type, commit or coverage config that already exists, the
 * shortcut an agent takes to turn a failing check green. Creating one is allowed.
 */
export const configLock: Guard = (input, files) => {
  const path = input.tool_input?.file_path;
  if (!EDITING_TOOLS.has(input.tool_name ?? '') || typeof path !== 'string') return allow;
  const name = basename(path);
  if (!isConfigFile(name) || !files.exists(resolve(input.cwd ?? '.', path))) return allow;
  return {
    block: true,
    reason:
      `${name} decides what the checks accept. Fix the code the check flags instead; ` +
      'if the config itself has to change, ask the user first.',
  };
};
