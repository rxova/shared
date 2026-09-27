import { describe, expect, it } from 'vitest';
import { isPlainObject } from './is-plain-object.js';
import { PREDICATE_CASES } from './predicate-cases.fixtures.js';

describe('isPlainObject', () => {
  it.each(PREDICATE_CASES)('answers for %s', (_label, value, _objectLike, _record, expected) => {
    expect(isPlainObject(value)).toBe(expected);
  });
});
