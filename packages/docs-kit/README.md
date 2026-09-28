<h1 align="center">@rxova/docs-kit</h1>

<p align="center">Markdown twins, llms.txt and a build check for an Astro Starlight docs site, so agents read the docs you wrote.</p>

<p align="center">
  <a href="https://github.com/rxova/shared/actions/workflows/ci.yml"><img src="https://github.com/rxova/shared/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A522.13-5fa04e?logo=nodedotjs&logoColor=white" alt="Node.js 22.13 or newer" />
  <img src="https://img.shields.io/badge/Starlight-%E2%9C%93-8c5cf6" alt="Works with Astro Starlight" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="No dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#api">API</a> ·
  <a href="#options">Options</a> ·
  <a href="#check-md-routes">check-md-routes</a>
</p>

An agent reading a docs site gets navigation, scripts and markup, or nothing it can follow. This
kit gives every page a plain-Markdown twin at `<route>.md`, writes `llms.txt` (an index of the
twins) and `llms-full.txt` (every page in one fetch), keeps doc-relative `.md` links working on the
HTML site, and fails the build when a twin is missing, still holds markup, links to a twin that
does not exist, or an llms file outgrows its budget.

```console
$ astro build && rxova-docs-kit check-md-routes
✔ 42 markdown twin(s), no unhandled markup, no dangling links
```

## What you get

|                        |                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 📄 **`.md` twins**     | `docsPages` and `renderMarkdown`: each page as Markdown with a title, description and `source` link. Fences verbatim. |
| 🗂️ **`llms.txt`**      | `llmsIndex`: the llmstxt.org index, one section per sidebar group, generated reference last under `## Optional`.      |
| 📚 **`llms-full.txt`** | `llmsFull`: every page inlined, in the same order.                                                                    |
| 🔗 **Links**           | `rehypeMdLinks`: `../rules/x.md` in a page links to `/rules/x/` on the HTML site, under the base.                     |
| ✅ **Build check**     | `rxova-docs-kit check-md-routes`: missing twins, leftover components, dangling twin links, size budgets.              |
| 🧪 **Plain functions** | Nothing imports `astro` or `@astrojs/starlight`: the site passes its own `getCollection("docs")` entries in.          |

## Install

Add it to the docs app as a dev dependency. It has no dependencies of its own.

```sh
pnpm --filter docs add -D @rxova/docs-kit
```

## Quick start

Three page files and one line of Astro config. Every difference between sites is an option.

**1. Links.** `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import { rehypeMdLinks } from "@rxova/docs-kit";

const site = "https://example.com";
const base = "/docs/";
const docsRoot = fileURLToPath(new URL("src/content/docs", import.meta.url));

export default defineConfig({
  site,
  base,
  markdown: { rehypePlugins: [[rehypeMdLinks, { base, docsRoot }]] },
  // …
});
```

**2. The site's settings, in one place.** `src/lib/docs.ts`:

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

**3. The twins.** `src/pages/[...slug].md.ts`:

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

**4. The llms files.** `src/pages/llms.txt.ts`:

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

`src/pages/llms-full.txt.ts` is the same with `llmsFull(await pages(), llms)`.

**5. The check.** The docs app's `package.json`:

```json
{ "scripts": { "build": "astro build && rxova-docs-kit check-md-routes" } }
```

The `llms.txt` it produces:

```md
# overlock

> A deterministic CLI that reads a git patch and reports …

Every link below is raw markdown. The human page is the same URL without the
`.md` suffix.

Everything inlined in one fetch: https://example.com/docs/llms-full.txt

## Run it

    npx overlock

## About

- [Overview](https://example.com/docs/index.md): What overlock checks and why.
```

## API

| Export                                | What it does                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `docsPages(entries, options)`         | Every page, normalized to Markdown with absolute links and sorted by id: the one list all surfaces share. |
| `renderMarkdown(page)`                | The document served at a `.md` route: frontmatter (`title`, `description`, `source`), H1, body.           |
| `llmsIndex(pages, options)`           | `llms.txt`: H1, summary, the llms-full link, a preamble, one section per group, optional pages last.      |
| `llmsFull(pages, options)`            | `llms-full.txt`: every page inlined in index order.                                                       |
| `groupPages(pages, options)`          | `{ groups, optional }`: the grouping both llms files use. No page is ever dropped.                        |
| `mdxToMarkdown(source, options)`      | One page body as plain Markdown. Never touches a code fence.                                              |
| `mapUnfenced(text, fn, onFenceOpen?)` | Applies `fn` to the text outside code fences only; `onFenceOpen` may rewrite each opening fence line.     |
| `splitFenced(text)`                   | `{ unfenced, openers }`: the prose outside fences and each opening fence line.                            |
| `rehypeMdLinks({ base, docsRoot })`   | Rehype plugin: `../rules/x.md` in a page links to `/rules/x/` under the base.                             |
| `withBase(url, base = "/")`           | A root-relative URL under the mount; relative and absolute URLs left alone; idempotent.                   |
| `mdRoute(id)` / `htmlRoute(id)`       | `/rules/x.md` and `/rules/x/`; the home page is `/index.md` and `/`.                                      |
| `sectionOf(id)`                       | The top directory, or `root`.                                                                             |
| `firstSentence(body)`                 | A description for a page whose frontmatter has none, or `undefined`.                                      |
| `checkMdRoutes(dist, options)`        | `{ failures, pages, twins }` for a built site. The bin prints and exits on it.                            |
| `twinFor(htmlPath)`                   | The twin a built page should have: `a/b/index.html` is `a/b.md`.                                          |

Types: `DocsEntry`, `DocsPage`, `DocsPagesOptions`, `ComponentRules`, `MdxToMarkdownOptions`,
`SplitDocument`, `RehypeMdLinksOptions`, `HastNode`, `SourceFile`, `LlmsOptions`,
`LlmsIndexOptions`, `GroupOptions`, `Grouped`, `OptionalPages`, `PageGroup`, `Section`,
`CheckMdRoutesOptions`, `CheckMdRoutesResult`, `Forbidden`.

## Options

### `docsPages(entries, options)`

| Option       | Default      | Effect                                                                                                     |
| ------------ | ------------ | ---------------------------------------------------------------------------------------------------------- |
| `origin`     | —            | Required: `import.meta.env.SITE`.                                                                          |
| `base`       | `"/"`        | `import.meta.env.BASE_URL`.                                                                                |
| `exclude`    | Splash pages | `(entry) => boolean`: entries to leave out.                                                                |
| `excludeIds` | None         | Ids to leave out as well, by list or `RegExp` (`/^api\//`, `/^playground\//`).                             |
| `sectionOf`  | `sectionOf`  | `(id) => string`, for a site not organised by top directory (an `api:<name>` key per generated reference). |
| `markdown`   | —            | Passed to `mdxToMarkdown`: `components`, `expand`, `fenceOpen`.                                            |

### `mdxToMarkdown(source, options)`

| Option       | Default       | Effect                                                                                                                                                     |
| ------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `origin`     | —             | Required: links are made absolute, since a twin is read detached from the site.                                                                            |
| `base`       | `"/"`         | The mount.                                                                                                                                                 |
| `fromRoute`  | `"/index.md"` | The twin's own route, for resolving doc-relative links.                                                                                                    |
| `components` | See below     | `{ unwrap?, headings? }`: layout components to remove, and components whose `label`/`title` becomes a heading.                                             |
| `expand`     | `[]`          | `((chunk) => string)[]`: site-specific passes run first on unfenced text, each free to emit fences (a live example into a `tsx` fence, a generated table). |
| `fenceOpen`  | None          | `(line) => string`: rewrites opening fence lines (drop a `live` meta).                                                                                     |

`Tabs`, `TabItem`, `CardGrid`, `Card`, `Steps`, `Aside` and `LinkCard` are always unwrapped;
`unwrap` adds more. `headings` merges over `{ TabItem: 4, Card: 3 }`, so an install snippet in a
`Tabs` block keeps saying which package manager it is for.

### `llmsIndex(pages, options)` and `llmsFull(pages, options)`

| Option     | Used by     | Effect                                                                                                                                                                                  |
| ---------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project`  | both        | Required: the H1.                                                                                                                                                                       |
| `summary`  | both        | Required: the blockquote under the H1, one line per entry.                                                                                                                              |
| `mount`    | `llmsIndex` | Required: `${SITE}${BASE_URL}`; `llms-full.txt` is linked absolutely from here.                                                                                                         |
| `preamble` | `llmsIndex` | Lines between the header and the sections: how to install or run it, rules for agents.                                                                                                  |
| `sections` | both        | `[key, heading][]` in reading order, usually the sidebar's. Unlisted sections follow alphabetically under their own key.                                                                |
| `optional` | both        | `{ match(section), order?, intro?, links?(pages) }`: generated reference kept out of the prose and listed last under `## Optional`; `links` collapses hundreds of pages to a few lines. |

`groupPages(pages, { sections, optional })` takes the same two keys.

### `checkMdRoutes(dist, options)`

| Option                       | Default        | Effect                                                                                                             |
| ---------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `untwinned`                  | `["404.html"]` | Built pages with no twin on purpose; an entry ending in `/` covers a directory. Redirect stubs are always skipped. |
| `maxFullBytes`               | 800 KiB        | Budget for `llms-full.txt`, checked when the file exists.                                                          |
| `maxIndexBytes`              | 24 KiB         | Budget for `llms.txt`, checked when the file exists.                                                               |
| `components`                 | The defaults   | The same rules given to `mdxToMarkdown`; any of them left in a twin fails.                                         |
| `forbidden`, `forbiddenInfo` | `[]`           | More `[RegExp, meaning]` pairs for the unfenced text of a twin and for its opening fence lines.                    |

Besides leftover components, a twin fails on an MDX `import`, a root-relative or unresolved
doc-relative link, a root-relative `href`/`src`, or an unresolved `import.meta.env.BASE_URL`, all
outside code fences.

## check-md-routes

The bin runs `checkMdRoutes` over a built site, `./dist` by default:

```sh
rxova-docs-kit check-md-routes [dist] [--untwinned 404.html,playground/] \
  [--max-full 800k] [--max-index 24k] [--components LiveExample,CodeRecipes]
```

| Flag           | Sets                                                        |
| -------------- | ----------------------------------------------------------- |
| `--untwinned`  | `untwinned`, comma-separated.                               |
| `--max-full`   | `maxFullBytes`: a byte count, or `k`/`m` (binary) suffixed. |
| `--max-index`  | `maxIndexBytes`, the same way.                              |
| `--components` | `components.unwrap`, comma-separated.                       |

Exit 0 when sound, 1 with the list of problems, 2 on a bad argument. `rxova-docs-kit --help` lists
the commands and `--version` prints the package version.

## License

[MIT](LICENSE)
