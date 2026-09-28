import { describe, expect, it } from 'vitest';
import { twinFor } from '@/check/twin-for';

describe('twinFor', () => {
  it.each([
    ['index.html', 'index.md'],
    ['rules/test-removed/index.html', 'rules/test-removed.md'],
    ['404.html', '404.html.md'],
  ])('%s -> %s', (html, md) => {
    expect(twinFor(html)).toBe(md);
  });
});
