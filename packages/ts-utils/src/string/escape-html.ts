import { HTML_ENTITIES } from '@/internal/string/html-entities';

/**
 * Text made safe to put between tags or inside a quoted attribute, in HTML and
 * in XML alike: `& < > " '` become entities, everything else is left as it is.
 * The apostrophe is `&#39;` rather than `&apos;`, which HTML 4 lacks.
 *
 * Not a sanitizer: it does not make a value safe inside a `<script>`, a
 * `style`, an unquoted attribute or a URL attribute that may hold
 * `javascript:`.
 */
export const escapeHtml = (value: string): string =>
  // The pattern names exactly the keys of the table, so every match has an entry.
  value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char as keyof typeof HTML_ENTITIES]);
