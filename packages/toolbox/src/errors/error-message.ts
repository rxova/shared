import { isError } from '@/errors/is-error';
import { objectTag } from '@/safe/object-tag';
import { readString } from '@/safe/read-string';

/**
 * The message to show for anything thrown. An `Error` gives its `message`, a
 * string is its own message, and anything else goes through `String()`, which
 * can itself throw — a null-prototype object has no `toString` — so that falls
 * back to the object's tag rather than escaping the handler it runs in.
 */
export const errorMessage = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (isError(value)) return readString(value, 'message') ?? '';
  try {
    return String(value);
  } catch {
    return objectTag(value) ?? 'Unknown error';
  }
};
