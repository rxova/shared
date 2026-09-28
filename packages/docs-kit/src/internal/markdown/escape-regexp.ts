/** `text` as a literal inside a regular expression. */
export const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
