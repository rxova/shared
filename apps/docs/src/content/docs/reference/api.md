---
title: Reference
description: Every export, command and action this repository publishes.
---

## `@rxova/ts-utils`

| Export                                                | What it answers                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `isObjectLike` / `isRecord` / `isPlainObject`         | Any non-null object / not an array / an object literal or null-prototype bag |
| `tryRead` / `readProperty` / `readString`             | Property reads that never throw                                              |
| `hasProperty` / `safeKeys` / `isInstanceOf`           | `in`, `Object.keys` and `instanceof` that never throw                        |
| `objectTag` / `arrayItems`                            | The `[object Tag]` string; a copy of an array                                |
| `isError` / `errorMessage`                            | A real `Error` from any realm; the text to show for anything thrown          |
| `isErrorLike`                                         | Any object with a string `message`                                           |
| `shallowEqual`                                        | `Object.is` per own key                                                      |
| `isDevelopment` / `createDevWarner`                   | Development detection; prefixed, coded, warn-once diagnostics                |
| `isNonProduction`                                     | Conservative non-production detection (`import.meta.env`, then `NODE_ENV`)   |
| `randomHex` / `escapeHtml` / `prefersReducedMotion`   | Random hex ids; HTML/XML escaping; the reduced-motion preference, now        |
| `canUseDOM` / `deepFreeze` / `clamp`                  | DOM presence; recursive freeze; a bounded number                             |
| `useIsomorphicLayoutEffect` (`@rxova/ts-utils/react`) | `useLayoutEffect` in the browser, `useEffect` on the server                  |
| `useLatestRef` / `useMediaQuery` (`/react`)           | The latest committed value in a stable ref; a live media query               |
| `assignRef` / `useMergedRefs` (`/react`)              | Feed a value to any ref; one callback ref for several                        |
| `useDevWarner` (`/react`)                             | `createDevWarner` per component instance, with an `onWarn` sink              |

## `@rxova/docs-kit`

The agent-facing surfaces of a Starlight site: `.md` twins, `llms.txt`, `llms-full.txt`, and the
check that holds them to it. Nothing imports Astro; a site passes in `getCollection('docs')`.

| Export                                                  | What it does                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `docsPages`                                             | Every page as normalized Markdown with absolute links, sorted by id   |
| `renderMarkdown`                                        | The document served at a page's `.md` route                           |
| `llmsIndex` / `llmsFull` / `groupPages`                 | `llms.txt`, `llms-full.txt`, and the section grouping both use        |
| `mdxToMarkdown` / `mapUnfenced` / `splitFenced`         | A page body as plain Markdown; rewrites that never touch a code fence |
| `rehypeMdLinks` / `withBase`                            | Doc-relative `.md` links to HTML routes; a root URL under the mount   |
| `mdRoute` / `htmlRoute` / `sectionOf` / `firstSentence` | Routes, sections and fallback descriptions                            |
| `checkMdRoutes` / `twinFor`                             | Missing twins, leftover markup, dangling twin links, llms budgets     |

The bin: `rxova-docs-kit check-md-routes [dist] [--untwinned a,b/] [--max-full 800k] [--max-index 24k] [--components A,B]`,
run after `astro build`.

## `@rxova/repo-config`

| Command                                         | What it does                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `rxova-repo-config verify [--only a,b]`         | Runs the pre-push gate, from `package.json#repoConfig.verify.steps`                                     |
| `rxova-repo-config pre-push`                    | The `.husky/pre-push` hook: skips a delete-only push, else verifies                                     |
| `rxova-repo-config check-changeset`             | Requires a changeset when a published package changed, and lints the ones added                         |
| `rxova-repo-config lint-changesets`             | Fails changesets the changelog would misread, or that name two packages under `singlePackage`           |
| `rxova-repo-config add-changeset <pkg> <bump>`  | Writes a one-package changeset without the prompt                                                       |
| `rxova-repo-config version`                     | `changeset version`, then the root version sync and a lockfile refresh                                  |
| `rxova-repo-config check-scope`                 | Reports `code-changed=false` for a release commit or a documentation-only range, per `repoConfig.scope` |
| `rxova-repo-config check-majors`                | Requires the published packages to share one major version                                              |
| `rxova-repo-config node-floor`                  | Reads the one `engines.node` floor the packages share                                                   |
| `rxova-repo-config pack-smoke [dir]`            | Packs, installs, imports and requires a package from its tarball, and checks what the tarball ships     |
| `rxova-repo-config check-exports [--profile p]` | `publint --strict` and `attw --pack .`, with the package's `repoConfig.exports.profile`                 |
| `rxova-repo-config post-publish-smoke`          | Installs and loads what npm serves after a release (`PUBLISHED_PACKAGES`)                               |
| `rxova-repo-config check-llms [root]`           | Holds each `llms.txt` to the package source, per `repoConfig.llms`                                      |
| `rxova-repo-config check-tsdoc`                 | Requires a TSDoc summary on every callable public export                                                |
| `rxova-repo-config check-banned`                | Fails docs that name removed APIs (`repoConfig.docs.banned`)                                            |
| `rxova-repo-config check-snippets`              | Requires every code fence in the READMEs and `llms.txt` files to parse                                  |
| `rxova-repo-config check-test-scripts`          | Requires a `test` script wherever a `vitest.config.*` is                                                |
| `rxova-repo-config check-file-size`             | Fails tracked files over `repoConfig.fileSize.max` lines                                                |
| `rxova-repo-config coverage-summary [path]`     | Writes the coverage totals to the job summary                                                           |
| `rxova-repo-config list-packages`               | Prints the packages a CI matrix runs over (`--marker`, `--github-output`)                               |

Every setting lives under `repoConfig` in the root `package.json`, and per package (`packSmoke`,
`llms`, `exports.profile`) in that package's own; the full schema is in the package README.

`check-scope` skips the heavy CI jobs for a documentation-only range: every changed file matches
`repoConfig.scope.ignore` (default `**/*.md`, `**/*.mdx`) and not `repoConfig.scope.keep` (default
`packages/*/*/**` and test and fixture folders, where Markdown is content a test reads), and none was
deleted. Changesets and changelogs count as well. `docs-only` then runs the light `docs-checks` job
instead, and `docs-changed` (a file under `repoConfig.scope.site`, default `apps/docs/**`) keeps the
docs site's build. `"ignore": []` turns the skip off.

`pack-smoke` also fails when a `files` entry (nested paths and globs included), the README, the
license or any `exports`, `main`, `types` or bin target is missing from the tarball; when it ships
`src/`, `e2e/`, `__tests__` or `*.test.*` / `*.spec.*` files that no `files` entry names; and when a
built entry lost the `'use client'` directive its source opens with. `workspace:` dependencies,
optional dependencies and peers resolve the way `pnpm publish` writes them.

### Presets

| Import                                                   | Export or content                                                                                                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@rxova/repo-config/eslint`                              | `rxova({ tsconfigRootDir, strict, react, astro, node, browser, tests, ignores, consoleAllowed, extends, rules }, ...extra)`; `baseEslintConfig` (deprecated, removed in 0.4.0) |
| `@rxova/repo-config/prettier`                            | Semicolons, double quotes, `printWidth: 100`, `trailingComma: "all"`, `arrowParens: "always"`, `prettier-plugin-astro`                                                         |
| `@rxova/repo-config/lint-staged`                         | ESLint then Prettier over staged code, Prettier over data and prose                                                                                                            |
| `@rxova/repo-config/tsdown`                              | `baseBuildConfig`, `dualBuildConfig`, `reactBuildConfig`                                                                                                                       |
| `@rxova/repo-config/vitest`                              | `baseVitestConfig`                                                                                                                                                             |
| `@rxova/repo-config/playwright`                          | `basePlaywrightConfig`, `astroPreview`                                                                                                                                         |
| `@rxova/repo-config/knip`                                | `baseKnipConfig`                                                                                                                                                               |
| `@rxova/repo-config/commitlint`                          | Conventional Commits, no length limits, plus `rename`                                                                                                                          |
| `@rxova/repo-config/changelog`                           | `@changesets/changelog-github` without the "Thanks" line                                                                                                                       |
| `@rxova/repo-config/tsconfig.{base,dom,react,node}.json` | Strict ESM TypeScript; plus DOM; plus `react-jsx`; Node type stripping                                                                                                         |

`rxova()` is `@eslint/js` recommended and typescript-eslint `recommendedTypeChecked`
(`strictTypeChecked` with `strict`) plus `no-unused-vars`, `consistent-type-imports`,
`no-explicit-any` and `no-console`, with no formatting or import-path rules; each option turns on a
layer or adds globs. `baseVitestConfig` holds every file to 95% coverage; a package can override
single axes with `thresholds` (`{ branches: 88 }`) or report only (`false`), drop coverage
(`coverage: false`), split a `browser` project from the unit one, and pass `plugins`, `dedupe`,
`alias`, timeouts, `globals`, `setupFiles`, `fileParallelism` and `silent` to Vitest. The
[package README](https://github.com/rxova/shared/tree/main/packages/repo-config#presets) lists
every option.

## `@rxova/agent-kit`

| Command                                                                                                       | What it does                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rxova-agent-kit list [--profile p]`                                                                          | Lists every agent, skill and hook, and the profiles that include it                                                                                          |
| `rxova-agent-kit install [--target t] [--profile p] [--add a,b] [--skip c] [--project] [--dry-run] [--force]` | Installs a profile (`core`, `hackathon`, `dotnet`, `react`, `qa`, `marketing`, `full`) for Claude Code, OpenCode or both (`--target claude\|opencode\|both`) |
| `rxova-agent-kit uninstall [--target t] [--project] [--dry-run]`                                              | Removes exactly what each install wrote                                                                                                                      |
| `rxova-agent-kit status [--target t] [--project]`                                                             | Shows each installed target's profile and any missing or changed file                                                                                        |

Hooks run on their own; Claude (or OpenCode) loads skills and hands work to agents when a
request matches their description, or when you name one (`/rx-kickoff`, "use rx-architect"). In
OpenCode the hooks run through a plugin the install writes. See the
[package README](https://github.com/rxova/shared/tree/main/packages/agent-kit#how-it-works) for
how it works, two worked examples, and what differs in OpenCode.

### Hooks

| Hook               | What it does                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `no-bypass`        | Blocks git calls that skip the repository's hooks (`--no-verify`, `HUSKY=0`, …)                                             |
| `no-attribution`   | Blocks commit messages and PR bodies that credit an AI assistant                                                            |
| `danger-zone`      | Blocks `rm -r` outside the project, force pushes to main, discarding work, dropping data (SQL, `dotnet ef`), cloud teardown |
| `dev-server`       | Blocks dev servers and watchers started in the foreground                                                                   |
| `config-lock`      | Blocks edits to existing lint, format, type, commit and coverage configs                                                    |
| `secret-guard`     | Blocks writing API keys, tokens and private keys into source files                                                          |
| `quick-check`      | Formats and lints each edited file with the project's tools, and reports problems back                                      |
| `memory-snapshot`  | Saves a snapshot note before compaction and at session end                                                                  |
| `handoff-reminder` | Points a new session at the latest handoff note or snapshot                                                                 |
| `context-nudge`    | Asks for a handoff note and a compact at 60% and 80% of the context window                                                  |

### Skills

Workflow:

| Skill               | Use it to                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `rx-kickoff`        | Turn an idea into a scoped plan, a repo with agent instructions, and a live deploy in hour one. |
| `rx-timebox`        | Run the build against the clock: checkpoints, cut lists, a feature freeze, the last two hours.  |
| `rx-slice`          | Break a feature into thin end-to-end slices and ship them one at a time.                        |
| `rx-parallel`       | Run several sessions and agents at once with worktrees, without collisions.                     |
| `rx-tdd`            | Test first where it pays, and skip it where it does not.                                        |
| `rx-debug`          | Reproduce, isolate and fix a bug at its root, with a regression test.                           |
| `rx-verify`         | Run the repository's own gate before calling work done.                                         |
| `rx-ship`           | Get a change merged the repository's way: branch, commits, checks, pull request.                |
| `rx-handoff`        | Write a note a fresh session can resume from, or resume from one.                               |
| `rx-e2e`            | Put a Playwright smoke suite on the demo path.                                                  |
| `rx-security-sweep` | Do a 30-minute security pass before the demo.                                                   |
| `rx-demo`           | Make the demo impossible to fail: seed data, a script, fallbacks, a backup video.               |
| `rx-theme-audit`    | Measure a site's dark and light themes in a browser and trace each problem to its source.       |

Stacks:

| Skill           | Use it to                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------- |
| `rx-react-web`  | Build with Next.js or Vite: rendering, data fetching, forms, env vars.                        |
| `rx-ui-kit`     | Get a good-looking, accessible UI fast with Tailwind and shadcn/ui, dark mode included.       |
| `rx-node-api`   | Build a typed API with Hono (or Fastify/Express): validation, errors, auth, CORS, tests.      |
| `rx-python-api` | Build an API with FastAPI and uv: models, dependencies, async database, tests, Docker.        |
| `rx-expo`       | Ship a React Native app with Expo: routing, devices, env vars, auth, EAS.                     |
| `rx-claude-api` | Add AI features with the Claude API: streaming, tools, structured output, caching, cost caps. |
| `rx-auth`       | Pick and wire authentication fast, with a seeded demo account.                                |

Platforms:

| Skill                  | Use it to                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `rx-supabase`          | Use Supabase: local dev, migrations, row-level security, storage, edge functions, types. |
| `rx-postgres`          | Use Postgres with Drizzle or Prisma: schema, migrations, pooling, indexes, seeds.        |
| `rx-deploy-vercel`     | Deploy to Vercel or Netlify: previews, env vars, monorepos, limits, rollback.            |
| `rx-deploy-cloudflare` | Deploy Workers and Pages with wrangler: bindings, secrets, D1, R2, KV.                   |
| `rx-deploy-container`  | Deploy containers to Fly.io, Railway or anywhere Docker runs.                            |
| `rx-aws`               | Take the fast paths on AWS, with a budget alarm first and a teardown list last.          |

React:

| Skill                  | Use it to                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `rx-fe-redux-toolkit`  | Use Redux Toolkit 2: store, slices, typed hooks, RTK Query tags and optimistic updates, migration.   |
| `rx-fe-code-splitting` | Split by route and feature, preload on intent, recover from stale chunks, hold a bundle budget.      |
| `rx-fe-hooks`          | Write custom hooks, drop effects you don't need, get deps and cleanup right, use React 19 hooks.     |
| `rx-fe-performance`    | Profile first, cut re-renders, lean on the React Compiler, virtualise lists, fix LCP, INP and CLS.   |
| `rx-fe-state`          | Decide where state lives: local, URL, server cache, store, context or form. Derive, don't duplicate. |
| `rx-fe-testing`        | Test components with Testing Library role queries, user-event and MSW; split component from e2e.     |

QA:

| Skill               | Use it to                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `rx-qa-test-plan`   | Plan a feature or release by risk: ranked risks, a test matrix, automated vs manual, exit criteria.  |
| `rx-qa-exploratory` | Run time-boxed exploratory sessions with charters, heuristics and tours; turn findings into tests.   |
| `rx-qa-bug-report`  | Write bugs anyone can reproduce: minimal steps, evidence, severity vs priority, then a failing test. |
| `rx-qa-regression`  | Scope smoke and regression runs from the diff and the risks, with a release checklist and sign-off.  |
| `rx-qa-flaky`       | Reproduce a flaky test with repeats and shuffles, fix the root cause, quarantine with an owner.      |
| `rx-qa-a11y`        | Test accessibility: axe, keyboard, screen reader, 400% reflow, forms, mapped to WCAG 2.2 AA.         |

Marketing:

| Skill                | Use it to                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `rx-mkt-positioning` | Pin down who it's for, the alternative, what's unique, the category and the one-liner.                 |
| `rx-mkt-landing`     | Write landing page and store listing copy, meta and OG text, in the site's own file, and measure it.   |
| `rx-mkt-launch`      | Plan a launch: channels and their rules, assets, a day-of timeline, funnel events, a retro.            |
| `rx-mkt-ceo`         | Think like the CEO: north-star and input metrics, weekly priorities, decision memos, pricing, updates. |
| `rx-mkt-voice`       | Set the app's voice and tone, fix microcopy and errors, keep a glossary and i18n-safe strings.         |

.NET:

| Skill               | Use it to                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `rx-dotnet-upgrade` | Move a service from .NET 6 or 8 to .NET 10: inventory, baseline, SDK and packages, breaking changes, images, CI. |
| `rx-dotnet-api`     | Build and upgrade ASP.NET Core APIs: minimal APIs or controllers, validation, ProblemDetails, auth, OpenAPI.     |
| `rx-efcore`         | Upgrade and use EF Core safely: breaking changes, migrations and production scripts, providers, performance.     |
| `rx-dotnet-workers` | Run hosted services and messaging reliably: shutdown, scopes, retries, idempotency, outbox, brokers.             |
| `rx-dotnet-testing` | Test with Shouldly: detect the framework, convert FluentAssertions, WebApplicationFactory, Testcontainers.       |

Datadog:

| Skill                    | Use it to                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `rx-datadog-dotnet`      | Instrument a .NET service with the tracer, service tags, log correlation and metrics, and keep it working through an upgrade.       |
| `rx-datadog-investigate` | Go from an alert or symptom to the failing span and its logs, before and after a deploy, through the Datadog MCP server or the API. |
| `rx-datadog-monitors`    | Manage monitors, SLOs and dashboards as code, and keep them valid after renames.                                                    |

### Agents

| Agent                | Model  | Can edit | Use it to                                                                                                                                                   |
| -------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rx-planner`         | fable  | no       | Turn a request into a sliced plan grounded in the code.                                                                                                     |
| `rx-architect`       | fable  | no       | Design the system for a time-boxed build: parts, data, boundaries.                                                                                          |
| `rx-security`        | fable  | no       | Find what would embarrass the demo: secrets, auth gaps, RLS, injection.                                                                                     |
| `rx-reviewer`        | opus   | no       | Review a diff and report only defects it can back.                                                                                                          |
| `rx-researcher`      | opus   | no       | Answer "how do I do X with Y" from official docs, with sources.                                                                                             |
| `rx-builder`         | opus   | yes      | Build one slice end to end, with tests.                                                                                                                     |
| `rx-debugger`        | opus   | yes      | Find a bug's root cause and fix it with a regression test.                                                                                                  |
| `rx-test-writer`     | opus   | yes      | Add tests that check behaviour.                                                                                                                             |
| `rx-build-fixer`     | opus   | yes      | Turn a red build green with the smallest honest diff.                                                                                                       |
| `rx-ui`              | opus   | yes      | Build and polish UI: responsive, accessible, every state.                                                                                                   |
| `rx-db`              | opus   | yes      | Design schemas, migrations, policies and demo seed data.                                                                                                    |
| `rx-deployer`        | opus   | yes      | Ship to the chosen platform and prove the live URL works.                                                                                                   |
| `rx-pitch`           | opus   | yes      | Write the demo script and the pitch.                                                                                                                        |
| `rx-scout`           | sonnet | no       | Find where things live without flooding the context.                                                                                                        |
| `rx-doc-writer`      | sonnet | yes      | Write a README a judge can follow in five minutes.                                                                                                          |
| `rx-dotnet-migrator` | opus   | yes      | Upgrade one .NET service to .NET 10: baseline, change, build, fix, test, smoke, with a log.                                                                 |
| `rx-dotnet-reviewer` | opus   | no       | Review a .NET diff: async, DI lifetimes, EF Core safety, behaviour the upgrade changed.                                                                     |
| `rx-observability`   | opus   | no       | Investigate production behaviour in Datadog and report with evidence; changes nothing unless asked. Has no tool list, so it can use the Datadog MCP server. |
| `rx-fe-builder`      | opus   | yes      | Build React features in the repo's own conventions, and verify them.                                                                                        |
| `rx-fe-reviewer`     | opus   | no       | Review React: hooks, effects, re-renders, state, a11y, bundle size.                                                                                         |
| `rx-qa-tester`       | opus   | yes      | Explore the running app against a charter; report bugs with evidence.                                                                                       |
| `rx-qa-flake-hunter` | opus   | yes      | Fix a flaky test at its root and prove it with repeat runs.                                                                                                 |
| `rx-mkt-advisor`     | fable  | yes      | A CEO's second opinion: test plans against the goal, cut, write memos.                                                                                      |
| `rx-mkt-marketer`    | opus   | yes      | Write positioning, landing and launch copy from what the code does.                                                                                         |
| `rx-mkt-copywriter`  | opus   | yes      | Rewrite in-app copy to the voice guide; strings only, never logic.                                                                                          |

## GitHub Actions

| Action                                    | Inputs                                                           | What it does                                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `rxova/shared/actions/setup-pnpm`         | `node-version`, `registry-url`                                   | pnpm from `packageManager` (install cached) and Node with the pnpm store cached                  |
| `rxova/shared/actions/turbo-cache`        | `key`                                                            | Restores and saves `.turbo` per job; pass `key` per matrix leg                                   |
| `rxova/shared/actions/turbo-remote-cache` | —                                                                | A Turbo remote cache backed by the Actions cache, per task hash                                  |
| `rxova/shared/actions/setup-playwright`   | `browsers`, `working-directory`, `install-script`                | Installs Playwright browsers, cached by Playwright version (resolved from `working-directory`)   |
| `rxova/shared/actions/pin-react`          | `react-version`, `types-version`, `types-dom-version`, `filters` | Pins one exact React at the workspace root and in `filters`, and fails if another still resolves |
| `rxova/shared/actions/require-jobs`       | `needs`                                                          | Fails unless every job in `needs` passed or was skipped (the `all checks` gate)                  |
| `rxova/shared/actions/notify-website`     | `project`, `token`, `base`, `framework`, `repository`, `dry-run` | Sends the `docs` dispatch that tells rxova.org to publish this run's `docs-dist` artifact        |

## Reusable workflows

Called at the job level as `uses: rxova/shared/.github/workflows/<file>@main`.

| Workflow                    | Inputs                                                                                                                                                                        | Outputs                                     | What it does                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `commit-messages.yml`       | `node-version`, `repo-config-command`, `check-scope`                                                                                                                          | `code-changed`, `docs-only`, `docs-changed` | Lints the branch or pushed commits and runs `check-scope`: the root job of a CI graph                     |
| `docs-checks.yml`           | `node-version`, `command`                                                                                                                                                     | —                                           | The light job for a documentation-only range: prettier by default, plus any prose checks the caller names |
| `lint-pr-title.yml`         | `node-version`                                                                                                                                                                | —                                           | Lints the PR title, read live from the API                                                                |
| `changeset-gate.yml`        | `node-version`, `repo-config-command`                                                                                                                                         | —                                           | `check-changeset` on pull requests, with labels and title from the event                                  |
| `react-minimum-version.yml` | `react-version`, `test-command`, `types-version`, `types-dom-version`, `filters`, `build-command`, `typecheck-command`, `node-version`, `node-options`, `playwright-browsers` | —                                           | Pins the oldest React at the root and in `filters`, then builds, tests and typechecks                     |
| `node-floor-smoke.yml`      | `node-version`, `build-command`, `extra-command`                                                                                                                              | —                                           | Runs `pack-smoke` for each published package on the Node floor its `engines` promises                     |
| `changesets-release.yml`    | `enabled`, `version-script`, `publish-script`, `node-version`, `run-verify`, `turbo-cache`, `commit-message`, `pr-title`                                                      | `published`, `published-packages`           | The version pull request, then publishing with npm trusted publishing and provenance                      |
| `snapshot-release.yml`      | `tag`, `node-version`, `verify-command`, `build-command`                                                                                                                      | —                                           | Publishes a snapshot prerelease under a dist-tag other than `latest`                                      |

## Renovate preset

`github>rxova/shared//renovate/default.json5`: `config:recommended`, one weekly non-major group,
a minimum release age, `chore(deps)` semantic commits, majors behind the dashboard, `pnpm dedupe`
after updates, patch and minor automerge through GitHub, and the TypeScript `<7` ceiling. A
repository's `.github/renovate.json5` extends it and keeps only its own `packageRules`.
