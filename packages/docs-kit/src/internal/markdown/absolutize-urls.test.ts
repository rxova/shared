import { describe, expect, it } from 'vitest';
import { absolutizeUrls } from '@/internal/markdown/absolutize-urls';

const options = { origin: 'https://x.org', base: '/docs/' };

describe('absolutizeUrls', () => {
  it('absolutizes markdown links and images', () => {
    expect(absolutizeUrls('[a](/rules/x/) ![i](/img.png)', options)).toBe(
      '[a](https://x.org/docs/rules/x/) ![i](https://x.org/docs/img.png)',
    );
  });

  it('absolutizes raw and BASE_URL attributes', () => {
    expect(absolutizeUrls('<img src="/a.png">', options)).toBe(
      '<img src="https://x.org/docs/a.png">',
    );
    expect(absolutizeUrls('<a href={`${import.meta.env.BASE_URL}guide/`}>', options)).toBe(
      '<a href="https://x.org/docs/guide/">',
    );
  });

  it('leaves protocol-relative and absolute URLs alone', () => {
    const text = '[a](//cdn/x) [b](https://e.com/) <img src="//cdn/x">';
    expect(absolutizeUrls(text, options)).toBe(text);
  });
});
