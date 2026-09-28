import type { BannedPattern } from '@/config/config.types';

/** Each line of `content` that matches a banned pattern, 1-based, once per pattern it matches. */
export const bannedMatches = (
  content: string,
  banned: readonly BannedPattern[],
): { line: number; name: string }[] => {
  const patterns = banned.map(({ name, pattern, flags = '' }) => ({
    name,
    regex: new RegExp(pattern, flags),
  }));
  return content
    .split('\n')
    .flatMap((text, index) =>
      patterns
        .filter(({ regex }) => regex.test(text))
        .map(({ name }) => ({ line: index + 1, name })),
    );
};
