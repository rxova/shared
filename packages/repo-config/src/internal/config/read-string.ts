import { failConfig } from '@/internal/config/fail-config';

/** `section[key]` as a non-empty string, or undefined when it is absent. */
export const readString = (
  section: Record<string, unknown>,
  key: string,
  path: string,
): string | undefined => {
  const value = section[key];
  if (value === undefined) return undefined;
  if (typeof value === 'string' && value !== '') return value;
  return failConfig(`${path}.${key}`, 'a non-empty string');
};
