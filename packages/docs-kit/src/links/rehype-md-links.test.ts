import { describe, expect, it } from 'vitest';
import type { HastNode } from '@/links/links.types';
import { rehypeMdLinks } from '@/links/rehype-md-links';

const DOCS_ROOT = '/repo/apps/docs/src/content/docs';

const anchor = (href: unknown): HastNode => ({
  type: 'element',
  tagName: 'a',
  properties: { href },
  children: [],
});

/** Runs the plugin over a one-link tree and hands back the rewritten href. */
const resolve = (href: unknown, { from = 'learn/severity.md', base = '/' } = {}) => {
  const node = anchor(href);
  const tree = { type: 'root', children: [{ type: 'element', tagName: 'p', children: [node] }] };
  rehypeMdLinks({ base, docsRoot: DOCS_ROOT })(tree, { path: `${DOCS_ROOT}/${from}` });
  return node.properties?.href;
};

describe('rehypeMdLinks', () => {
  it('turns a doc-relative source path into the route that serves it', () => {
    expect(resolve('../reference/cli.md')).toBe('/reference/cli/');
    expect(resolve('./false-positives.md')).toBe('/learn/false-positives/');
  });

  it('resolves a bare relative path, written without a leading ./', () => {
    expect(resolve('reference/cli.md', { from: 'index.md' })).toBe('/reference/cli/');
  });

  it('keeps the fragment', () => {
    expect(resolve('../rules/overview.md#the-rules')).toBe('/rules/overview/#the-rules');
  });

  it('serves the home page at /, not /index/', () => {
    expect(resolve('../index.md')).toBe('/');
  });

  it('applies the mount base', () => {
    expect(resolve('../reference/cli.md', { base: '/packages/overlock/' })).toBe(
      '/packages/overlock/reference/cli/',
    );
  });

  it.each([
    '/reference/cli/',
    'https://github.com/rxova/overlock/blob/main/README.md',
    '#a-fragment-on-this-page',
    '../assets/logo.svg',
    42,
  ])('leaves %s alone', (href) => {
    expect(resolve(href)).toBe(href);
  });

  it('skips elements that are not links, or have no properties', () => {
    const img: HastNode = { type: 'element', tagName: 'img', properties: { href: 'a.md' } };
    const bare: HastNode = { type: 'element', tagName: 'a' };
    const tree: HastNode = { type: 'root', children: [img, bare, { type: 'text' }] };
    rehypeMdLinks({ base: '/', docsRoot: DOCS_ROOT })(tree, { path: `${DOCS_ROOT}/index.md` });
    expect(img.properties?.href).toBe('a.md');
    expect(bare.properties).toBeUndefined();
  });

  it('does nothing to a page with no source file, rather than throwing', () => {
    const node = anchor('../reference/cli.md');
    const plugin = rehypeMdLinks({ base: '/', docsRoot: DOCS_ROOT });
    plugin({ type: 'root', children: [node] }, {});
    plugin({ type: 'root', children: [node] });
    expect(node.properties?.href).toBe('../reference/cli.md');
  });
});
