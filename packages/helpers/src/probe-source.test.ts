import { describe, expect, it } from 'vitest';
import { probeSource } from './probe-source.ts';

describe('probeSource', () => {
  it('imports and requires the package by name through its exports map', () => {
    const source = probeSource('@scope/example');
    expect(source).toContain('await import("@scope/example")');
    expect(source).toContain('createRequire(import.meta.url)("@scope/example")');
  });
});
