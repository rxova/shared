import { describe, expect, it } from 'vitest';
import { htmlRoute } from '@/pages/html-route';

describe('htmlRoute', () => {
  it('serves the home page at /', () => {
    expect(htmlRoute('index')).toBe('/');
    expect(htmlRoute('')).toBe('/');
  });

  it('serves every other id as a directory', () => {
    expect(htmlRoute('rules/test-removed')).toBe('/rules/test-removed/');
  });
});
