import { basename } from 'node:path';
import type { Guard } from '@/hooks/hook.types';
import { allow } from '@/internal/hooks/allow';
import { findSecret } from '@/internal/hooks/find-secret';
import { isEnvFile } from '@/internal/hooks/is-env-file';
import { writtenText } from '@/internal/hooks/written-text';

/**
 * Stops a credential being written into a source file, where it gets committed. Local `.env`
 * files are where secrets belong, so writes there pass.
 */
export const secretGuard: Guard = (input) => {
  const path = input.tool_input?.file_path;
  if (typeof path !== 'string' || isEnvFile(basename(path))) return allow;
  const found = findSecret(writtenText(input));
  if (found === undefined) return allow;
  return {
    block: true,
    reason:
      `This would write ${found} into ${basename(path)}. Put it in .env (git-ignored), read it ` +
      'from the environment, and add the name without the value to .env.example.',
  };
};
