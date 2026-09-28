import { describe, expect, it } from 'vitest';
import { stripImports } from '@/internal/markdown/strip-imports';

describe('stripImports', () => {
  it('removes an import line', () => {
    expect(stripImports("import { Tabs } from '@astrojs/starlight/components';\n\nText.")).toBe(
      '\nText.',
    );
  });

  it('leaves prose that merely starts with the word import', () => {
    const prose = 'imports are stripped only at the start of a line.';
    expect(stripImports(prose)).toBe(prose);
  });
});
