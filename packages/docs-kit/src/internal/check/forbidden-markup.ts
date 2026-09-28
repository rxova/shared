import type { Forbidden } from '@/check/check.types';
import { escapeRegExp } from '@/internal/markdown/escape-regexp';

/**
 * What must not survive into a twin, given the components the normalizer
 * unwraps. Checked against unfenced text only: a fence may legitimately hold
 * any of it, and "fixing" a snippet to pass would corrupt the example.
 */
export const forbiddenMarkup = (components: readonly string[]): Forbidden[] => [
  [
    new RegExp(`<(?:${components.map(escapeRegExp).join('|')})\\b`),
    'an unhandled Starlight/MDX component',
  ],
  [/^import\s.+\sfrom\s['"]/m, 'an MDX import that should have been stripped'],
  [/\]\(\/(?!\/)/, 'a root-relative link, unresolvable outside the site'],
  [/\]\(\.{1,2}\//, 'a doc-relative link that was not resolved'],
  [/\b(?:href|src)="\/(?!\/)/, 'a root-relative HTML attribute'],
  [/\bimport\.meta\.env\.BASE_URL/, 'an unresolved BASE_URL expression'],
];
