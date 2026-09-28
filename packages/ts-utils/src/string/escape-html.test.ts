import { describe, expect, it } from 'vitest';
import { escapeHtml } from '@/string/escape-html';

describe('escapeHtml', () => {
  it('escapes the five characters that matter in text and quoted attributes', () => {
    expect(escapeHtml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;',
    );
  });

  it('escapes an ampersand once, so escaping is not idempotent by accident', () => {
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });

  it('leaves everything else alone', () => {
    expect(escapeHtml('plain text, ünïcode ✓')).toBe('plain text, ünïcode ✓');
    expect(escapeHtml('')).toBe('');
  });
});
