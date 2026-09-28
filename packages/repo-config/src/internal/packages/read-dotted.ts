import { isRecord } from '@/internal/config/is-record';

/** The value at a dotted `path` (`rxova.slug`) inside `value`, or undefined when any step is missing. */
export const readDotted = (value: unknown, path: string): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (at, key) => (isRecord(at) && Object.hasOwn(at, key) ? at[key] : undefined),
      value,
    );
