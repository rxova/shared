import { describe, expect, it } from 'vitest';
import { errorMessage } from './error-message.js';

describe('errorMessage', () => {
  it('reads an error message', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
  });

  it('keeps a thrown string as it is', () => {
    expect(errorMessage('boom')).toBe('boom');
  });

  it('stringifies anything else', () => {
    expect(errorMessage(42)).toBe('42');
    expect(errorMessage(undefined)).toBe('undefined');
  });

  it('is empty for an error whose message getter throws', () => {
    const error = new Error('x');
    Object.defineProperty(error, 'message', {
      get() {
        throw new Error('getter');
      },
    });
    expect(errorMessage(error)).toBe('');
  });

  it('falls back to the tag when String() throws', () => {
    expect(errorMessage(Object.create(null))).toBe('[object Object]');
  });

  it('falls back to a fixed text when even the tag is refused', () => {
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();
    expect(errorMessage(proxy)).toBe('Unknown error');
  });
});
