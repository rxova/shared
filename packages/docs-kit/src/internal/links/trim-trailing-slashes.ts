/**
 * `text` without its trailing slashes. A loop rather than `/\/+$/`, whose
 * backtracking is quadratic on a long run of slashes that does not end the
 * string.
 */
export const trimTrailingSlashes = (text: string): string => {
  let end = text.length;
  while (end > 0 && text[end - 1] === '/') end -= 1;
  return text.slice(0, end);
};
