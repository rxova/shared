import { describe, expect, it } from 'vitest';
import { parseBanned } from '@/internal/config/parse-banned';

describe('parseBanned', () => {
  it('reads name, pattern and flags', () => {
    expect(
      parseBanned(
        [
          { name: 'old', pattern: '\\boldApi\\b' },
          { name: 'x', pattern: 'x', flags: 'i' },
        ],
        'b',
      ),
    ).toEqual([
      { name: 'old', pattern: '\\boldApi\\b' },
      { name: 'x', pattern: 'x', flags: 'i' },
    ]);
  });

  it.each([
    [{}, 'b must be an array'],
    [['x'], 'b[0] must be a { name, pattern, flags? } object'],
    [[{ name: 'x' }], 'b[0] must be a { name, pattern, flags? } object'],
    [[{ pattern: 'x' }], 'b[0] must be a { name, pattern, flags? } object'],
    [[{ name: 'x', pattern: 'x', extra: 1 }], 'unknown key "extra"'],
    [[{ name: 'x', pattern: 'x', flags: 'g' }], 'b[0].flags must be made of the flags'],
    [[{ name: 'x', pattern: '[' }], 'b[0].pattern must be a valid regular expression'],
  ])('refuses %j', (value, message) => {
    expect(() => parseBanned(value, 'b')).toThrow(message);
  });
});
