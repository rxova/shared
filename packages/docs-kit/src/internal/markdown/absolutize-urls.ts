import { withBase } from '@/links/with-base';

/**
 * Site-root URLs as absolute ones: markdown links and images, raw `href`/`src`
 * attributes, and JSX attributes built on `import.meta.env.BASE_URL`. A twin is
 * read detached from the site — pasted into a prompt, fetched on its own — so a
 * root-relative link there is unresolvable, not merely inconvenient.
 */
export const absolutizeUrls = (
  text: string,
  { origin, base }: { origin: string; base: string },
): string => {
  const url = (pathname: string) => `${origin}${withBase(pathname, base)}`;
  return text
    .replace(/(\]\()(\/(?!\/)[^)\s]*)/g, (_, open: string, path: string) => open + url(path))
    .replace(
      /\b(href|src)="(\/(?!\/)[^"]*)"/g,
      (_, attr: string, path: string) => `${attr}="${url(path)}"`,
    )
    .replace(
      /\b(href|src)=\{`\$\{import\.meta\.env\.BASE_URL\}([^`]*)`\}/g,
      (_, attr: string, rest: string) => `${attr}="${url(`/${rest}`)}"`,
    );
};
