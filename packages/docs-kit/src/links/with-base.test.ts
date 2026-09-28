import { describe, expect, it } from 'vitest';
import { withBase } from '@/links/with-base';

describe('withBase', () => {
  it('prefixes a root-relative URL with the base, trailing slash or not', () => {
    expect(withBase('/rules/x/', '/packages/overlock/')).toBe('/packages/overlock/rules/x/');
    expect(withBase('/rules/x/', '/packages/overlock')).toBe('/packages/overlock/rules/x/');
  });

  it('is a no-op at the root base and by default', () => {
    expect(withBase('/rules/x/', '/')).toBe('/rules/x/');
    expect(withBase('/rules/x/')).toBe('/rules/x/');
  });

  it('leaves relative, protocol-relative and absolute URLs alone', () => {
    for (const url of ['rules/x', '../x.md', '//cdn.example/x', 'https://example.com/x', '#top']) {
      expect(withBase(url, '/docs/')).toBe(url);
    }
  });

  it('does not apply the base twice', () => {
    expect(withBase('/docs/x/', '/docs/')).toBe('/docs/x/');
    expect(withBase('/docs', '/docs/')).toBe('/docs');
    expect(withBase('/docsearch/', '/docs/')).toBe('/docs/docsearch/');
  });
});
