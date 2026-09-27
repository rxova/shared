import { describe, expect, it } from 'vitest';
import { isRecord } from './is-record.js';
import { PREDICATE_CASES } from './predicate-cases.fixtures.js';

describe('isRecord', () => {
  it.each(PREDICATE_CASES)('answers for %s', (_label, value, _objectLike, expected) => {
    expect(isRecord(value)).toBe(expected);
  });
});
