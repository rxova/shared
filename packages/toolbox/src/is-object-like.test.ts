import { describe, expect, it } from 'vitest';
import { isObjectLike } from './is-object-like.js';
import { PREDICATE_CASES } from './predicate-cases.fixtures.js';

describe('isObjectLike', () => {
  it.each(PREDICATE_CASES)('is %s for %s', (_label, value, expected) => {
    expect(isObjectLike(value)).toBe(expected);
  });
});
