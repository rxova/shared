import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion } from '@/dom/prefers-reduced-motion';

afterEach(() => {
  vi.unstubAllGlobals();
});

const stubDom = (window: object) => {
  vi.stubGlobal('window', window);
  vi.stubGlobal('document', {});
};

describe('prefersReducedMotion', () => {
  it('is false without a DOM', () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it('is false where matchMedia is missing, as in jsdom', () => {
    stubDom({});
    expect(prefersReducedMotion()).toBe(false);
  });

  it.each([true, false])('reports the media query as %s', (matches) => {
    const matchMedia = vi.fn(() => ({ matches }));
    const window = { matchMedia };
    stubDom(window);
    expect(prefersReducedMotion()).toBe(matches);
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(matchMedia.mock.contexts[0]).toBe(window);
  });
});
