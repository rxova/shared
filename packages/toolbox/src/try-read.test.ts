import { describe, expect, it } from 'vitest';
import { throwingGetter } from './safe-values.fixtures.js';
import { tryRead } from './try-read.js';

describe('tryRead', () => {
  it('reports a successful read', () => {
    expect(tryRead({ a: 1 }, 'a')).toEqual({ ok: true, value: 1 });
  });

  it('reports a getter that throws', () => {
    expect(tryRead(throwingGetter, 'value')).toEqual({ ok: false });
  });
});
