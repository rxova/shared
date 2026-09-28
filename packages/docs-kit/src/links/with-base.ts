/**
 * A site-root-relative URL prefixed with the site's `base`.
 *
 * Astro emits a root-relative URL verbatim, so a site mounted under a prefix
 * (`/packages/overlock/` on the rxova.org aggregator) would otherwise link one
 * directory above itself. Everything that writes a link into the agent-facing
 * surfaces goes through here.
 *
 * Left alone: relative, protocol-relative (`//host`) and absolute URLs, and a
 * URL that already carries the base — so applying it twice is a no-op.
 */
export const withBase = (url: string, base = '/'): string => {
  const prefix = base.replace(/\/+$/, '');
  if (prefix === '' || !url.startsWith('/') || url.startsWith('//')) return url;
  if (url === prefix || url.startsWith(`${prefix}/`)) return url;
  return prefix + url;
};
