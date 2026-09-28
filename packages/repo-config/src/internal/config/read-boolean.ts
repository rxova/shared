import { failConfig } from '@/internal/config/fail-config';

/** `section[key]` as a boolean, or undefined when it is absent. */
export const readBoolean = (
  section: Record<string, unknown>,
  key: string,
  path: string,
): boolean | undefined => {
  const value = section[key];
  if (value === undefined || typeof value === 'boolean') return value;
  return failConfig(`${path}.${key}`, 'a boolean');
};
