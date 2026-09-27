import type { Step } from '@/config/config.types';
import { failConfig } from '@/internal/config/fail-config';
import { isRecord } from '@/internal/config/is-record';

/** `tooling.verify.steps`, checked: an array of `{ name, command }` pairs of non-empty strings. */
export const parseSteps = (value: unknown): Step[] => {
  if (!Array.isArray(value)) return failConfig('tooling.verify.steps', 'an array');
  return value.map((step: unknown, index) => {
    if (
      !isRecord(step) ||
      typeof step.name !== 'string' ||
      step.name === '' ||
      typeof step.command !== 'string' ||
      step.command === ''
    ) {
      return failConfig(
        `tooling.verify.steps[${String(index)}]`,
        'a { name, command } pair of strings',
      );
    }
    return { name: step.name, command: step.command };
  });
};
