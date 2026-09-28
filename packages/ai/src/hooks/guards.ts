import type { Guard } from '@/hooks/guard.types';
import { configLock } from '@/hooks/config-lock';
import { noAttribution } from '@/hooks/no-attribution';
import { noBypass } from '@/hooks/no-bypass';

/** Every guard by the name the hook command passes, and the tools each one watches. */
export const guards = {
  'no-bypass': { guard: noBypass, matcher: 'Bash' },
  'no-attribution': { guard: noAttribution, matcher: 'Bash' },
  'config-lock': { guard: configLock, matcher: 'Edit|Write|MultiEdit' },
} as const satisfies Record<string, { guard: Guard; matcher: string }>;

export type GuardName = keyof typeof guards;
