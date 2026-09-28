import { describe, expect, it } from 'vitest';
import { isErrorLike } from '@/errors/is-error-like';

describe('isErrorLike', () => {
  it.each([
    ['an Error', new TypeError('x')],
    ['a plain object with a message', { message: 'x', status: 404 }],
    ['an empty message', { message: '' }],
  ])('accepts %s', (_, value) => {
    expect(isErrorLike(value)).toBe(true);
  });

  it.each([
    ['null', null],
    ['a string', 'x'],
    ['a non-string message', { message: 1 }],
    ['an object without a message', {}],
    [
      'a throwing getter',
      Object.defineProperty({}, 'message', {
        get: () => {
          throw new Error('no');
        },
      }),
    ],
  ])('rejects %s', (_, value) => {
    expect(isErrorLike(value)).toBe(false);
  });
});
