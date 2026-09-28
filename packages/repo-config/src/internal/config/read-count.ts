import { failConfig } from '@/internal/config/fail-config';

/** `section[key]` as a positive integer, or undefined when it is absent. */
export const readCount = (
  section: Record<string, unknown>,
  key: string,
  path: string,
): number | undefined => {
  const value = section[key];
  if (value === undefined) return undefined;
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  return failConfig(`${path}.${key}`, 'a positive integer');
};
