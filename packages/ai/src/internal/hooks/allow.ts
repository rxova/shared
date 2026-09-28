import type { Verdict } from '@/hooks/guard.types';

/** The verdict that lets a tool call through. */
export const allow: Verdict = { block: false };
