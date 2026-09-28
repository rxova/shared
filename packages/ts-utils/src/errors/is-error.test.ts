import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { isError } from '@/errors/is-error';

describe('isError', () => {
  it('accepts an Error and its subclasses', () => {
    expect(isError(new Error('x'))).toBe(true);
    expect(isError(new TypeError('x'))).toBe(true);
  });

  it('accepts an Error from another realm', () => {
    const foreign: unknown = runInNewContext('new Error("x")');
    expect(foreign instanceof Error).toBe(false);
    expect(isError(foreign)).toBe(true);
  });

  it.each([{ message: 'x' }, 'x', null, undefined, 1])('rejects %j', (value) => {
    expect(isError(value)).toBe(false);
  });
});
