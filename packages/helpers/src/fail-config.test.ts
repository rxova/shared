import { describe, expect, it } from 'vitest';
import { failConfig } from './fail-config.ts';

describe('failConfig', () => {
  it('names the field and what it should have been', () => {
    expect(() => failConfig('tooling.verify', 'an object')).toThrow(
      'package.json#tooling.verify must be an object',
    );
  });
});
