import { describe, expect, it } from 'vitest';
import { isRecord } from '@/predicates/is-record';
import { PREDICATE_CASES } from '@/predicates/predicate-cases.fixtures';

describe('isRecord', () => {
  it.each(PREDICATE_CASES)('answers for %s', (_label, value, _objectLike, expected) => {
    expect(isRecord(value)).toBe(expected);
  });
});
