import { normalizePath } from "@/internal/markdown/normalize-path";
import { withBase } from "@/links/with-base";

/**
 * Doc-relative `.md` links as absolute twin URLs. `../rules/x.md` written in
 * `learn/severity.md` means the source file `rules/x.md`, whose twin is served
 * at `/rules/x.md` — the twin route is the source path — so resolving the link
 * as a path from the twin's own route lands on the right document, and the
 * fragment rides along. Lowercased, because Astro's content layer lowercases
 * the path it derives an entry id from.
 */
export const resolveRelativeLinks = (
  text: string,
  { origin, base, fromRoute }: { origin: string; base: string; fromRoute: string },
): string => {
  const dir = fromRoute.slice(0, fromRoute.lastIndexOf("/") + 1);
  return text.replace(
    /(\]\()(\.{1,2}\/[^)\s#]*\.md)(#[^)\s]*)?(\))/g,
    (_, open: string, path: string, hash: string | undefined, close: string) =>
      `${open}${origin}${withBase(normalizePath(dir + path).toLowerCase(), base)}${hash ?? ""}${close}`,
  );
};
