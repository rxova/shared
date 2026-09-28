# @rxova/docs-kit

The agent-facing surfaces of an Astro Starlight docs site, shared instead of copied:

- a raw-Markdown twin of every page at `<route>.md`,
- `llms.txt` (an index of the twins) and `llms-full.txt` (every page inlined),
- a rehype plugin that points doc-relative `.md` links at the HTML route that serves them,
- `rxova-docs-kit check-md-routes`, which fails the build when a twin is missing, still holds
  markup, links to a twin that does not exist, or an llms file outgrows its budget.

Plain functions over plain objects: nothing here imports `astro` or `@astrojs/starlight`, so the
rules are tested without an Astro build, and a site passes in its own collection entries.

```sh
pnpm add -D @rxova/docs-kit
```

## Wiring

Three page files and one line of Astro config. Every difference between sites is an option.

`astro.config.mjs`:

```js
import { fileURLToPath } from "node:url";
import { rehypeMdLinks } from "@rxova/docs-kit";

const docsRoot = fileURLToPath(new URL("src/content/docs", import.meta.url));

export default defineConfig({
  site,
  base,
  markdown: { rehypePlugins: [[rehypeMdLinks, { base, docsRoot }]] },
  // …
});
```

`src/lib/docs.ts` — the site's own settings, in one place:

```ts
import { getCollection } from "astro:content";
import { docsPages, type LlmsOptions } from "@rxova/docs-kit";

export const pages = async () =>
  docsPages(await getCollection("docs"), {
    origin: import.meta.env.SITE,
    base: import.meta.env.BASE_URL,
  });

export const llms: LlmsOptions = {
  project: "overlock",
  summary: ["A deterministic CLI that reads a git patch and reports …"],
  sections: [
    ["root", "About"],
    ["learn", "Learn"],
    ["reference", "Reference"],
  ],
};
```

`src/pages/[...slug].md.ts`:

```ts
import type { APIRoute, GetStaticPaths } from "astro";
import { renderMarkdown, type DocsPage } from "@rxova/docs-kit";
import { pages } from "../lib/docs";

export const prerender = true;
export const getStaticPaths: GetStaticPaths = async () =>
  (await pages()).map((page) => ({ params: { slug: page.id }, props: { page } }));
export const GET: APIRoute = ({ props }) =>
  new Response(renderMarkdown((props as { page: DocsPage }).page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
```

`src/pages/llms.txt.ts` (and `llms-full.txt.ts` with `llmsFull(await pages(), llms)`):

```ts
import type { APIRoute } from "astro";
import { llmsIndex } from "@rxova/docs-kit";
import { llms, pages } from "../lib/docs";

export const prerender = true;
export const GET: APIRoute = async () =>
  new Response(
    llmsIndex(await pages(), {
      ...llms,
      mount: `${import.meta.env.SITE}${import.meta.env.BASE_URL}`,
      preamble: ["## Run it", "", "    npx overlock", ""],
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
```

`package.json`:

```json
{ "scripts": { "build": "astro build && rxova-docs-kit check-md-routes" } }
```

## API

| Export                                | What it does                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `docsPages(entries, options)`         | Every page, normalized to Markdown with absolute links and sorted by id: the one list all surfaces share. |
| `renderMarkdown(page)`                | The document served at a `.md` route: frontmatter (`title`, `description`, `source`), H1, body.           |
| `llmsIndex(pages, options)`           | `llms.txt`: H1, summary, the llms-full link, a preamble, one section per group, optional pages last.      |
| `llmsFull(pages, options)`            | `llms-full.txt`: every page inlined in index order.                                                       |
| `groupPages(pages, options)`          | The grouping both llms files use.                                                                         |
| `mdxToMarkdown(source, options)`      | One page body as plain Markdown. Never touches a code fence.                                              |
| `mapUnfenced(text, fn, onFenceOpen?)` | Applies `fn` to the text outside code fences only.                                                        |
| `splitFenced(text)`                   | `{ unfenced, openers }`: the prose outside fences and each opening fence line.                            |
| `rehypeMdLinks({ base, docsRoot })`   | Rehype plugin: `../rules/x.md` in a page links to `/rules/x/` under the base.                             |
| `withBase(url, base)`                 | A root-relative URL under the mount; idempotent.                                                          |
| `mdRoute(id)` / `htmlRoute(id)`       | `/rules/x.md` and `/rules/x/`; the home page is `/index.md` and `/`.                                      |
| `sectionOf(id)`                       | The top directory, or `root`.                                                                             |
| `firstSentence(body)`                 | A description for a page whose frontmatter has none.                                                      |
| `checkMdRoutes(dist, options)`        | `{ failures, pages, twins }` for a built site. The bin prints and exits on it.                            |
| `twinFor(htmlPath)`                   | The twin a built page should have: `a/b/index.html` is `a/b.md`.                                          |

### Options

`docsPages(entries, { origin, base = '/', exclude, excludeIds, sectionOf, markdown })`

- `exclude(entry)` — defaults to leaving out splash pages. `excludeIds` adds ids by list or
  `RegExp` (`/^api\//`, `/^playground\//`).
- `sectionOf(id)` — for a site not organised by top directory (per-component sections, an
  `api:<name>` key for each generated reference).
- `markdown` — passed to `mdxToMarkdown`:
  - `components: { unwrap?: string[]; headings?: Record<string, number> }` — layout components
    to remove beside `Tabs`, `TabItem`, `CardGrid`, `Card`, `Steps`, `Aside`, `LinkCard`, and
    components whose `label`/`title` becomes a heading (`TabItem: 4`, `Card: 3` by default).
  - `expand: ((chunk) => string)[]` — site-specific passes run first on unfenced text, each
    free to emit fences (a live example into a `tsx` fence, a generated table).
  - `fenceOpen(line)` — rewrites opening fence lines (drop a `live` meta).

`llmsIndex(pages, { project, summary, mount, preamble?, sections?, optional? })`, and
`llmsFull(pages, { project, summary, sections?, optional? })`

- `sections: [key, heading][]` — reading order, usually the sidebar's. Unlisted sections follow
  alphabetically under their own key, so a new directory is never dropped.
- `optional: { match(section), intro?, links?(pages) }` — generated reference kept out of the
  prose and listed last under `## Optional`; `links` collapses hundreds of pages to a few lines.

`checkMdRoutes(dist, { untwinned, maxFullBytes, maxIndexBytes, components, forbidden, forbiddenInfo })`

- `untwinned` — built pages with no twin on purpose, default `['404.html']`; an entry ending in
  `/` covers a directory. Redirect stubs are always skipped.
- `maxFullBytes` (800 KiB) and `maxIndexBytes` (24 KiB) — budgets for `llms-full.txt` and
  `llms.txt`, checked only when the files exist.
- `components` — the same rules given to `mdxToMarkdown`; any of them left in a twin fails.
- `forbidden`, `forbiddenInfo` — more `[RegExp, meaning]` pairs for the unfenced text and for
  opening fence lines.

The bin takes the same as flags:

```sh
rxova-docs-kit check-md-routes [dist] [--untwinned 404.html,playground/] \
  [--max-full 800k] [--max-index 24k] [--components LiveExample,CodeRecipes]
```

Exit 0 when sound, 1 with the list of problems, 2 on a bad argument.

## License

MIT
