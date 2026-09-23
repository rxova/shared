---
title: Reference
description: Every export, command and action this repository publishes.
---

## `@rxova/toolbox`

| Export                                               | What it answers                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `isObjectLike` / `isRecord` / `isPlainObject`        | Any non-null object / not an array / an object literal or null-prototype bag |
| `tryRead` / `readProperty` / `readString`            | Property reads that never throw                                              |
| `hasProperty` / `safeKeys` / `isInstanceOf`          | `in`, `Object.keys` and `instanceof` that never throw                        |
| `objectTag` / `arrayItems`                           | The `[object Tag]` string; a copy of an array                                |
| `isError` / `errorMessage`                           | A real `Error` from any realm; the text to show for anything thrown          |
| `shallowEqual`                                       | `Object.is` per own key                                                      |
| `isDevelopment` / `createDevWarner`                  | Development detection; prefixed, coded, warn-once diagnostics                |
| `canUseDOM` / `deepFreeze` / `clamp`                 | DOM presence; recursive freeze; a bounded number                             |
| `useIsomorphicLayoutEffect` (`@rxova/toolbox/react`) | `useLayoutEffect` in the browser, `useEffect` on the server                  |

## `@rxova/tooling`

| Command                                                   | What it does                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `rxova-tooling verify [--only a,b]`                       | Runs the pre-push gate, from `package.json#tooling.verify.steps` |
| `rxova-tooling check-changeset`                           | Requires a changeset when a published package changed            |
| `rxova-tooling check-scope`                               | Reports `code-changed=false` for a release commit                |
| `rxova-tooling node-floor`                                | Reads the one `engines.node` floor the packages share            |
| `rxova-tooling pack-smoke [dir]`                          | Packs, installs, imports and requires a package from its tarball |
| `rxova-tooling check-llms [root]`                         | Holds each `llms.txt` to the package exports                     |
| `rxova-tooling write-page-bundle <dist> <project> <base>` | Marks a docs dist for the rxova.org aggregator                   |

Presets: `@rxova/tooling/tsdown`, `/vitest`, `/eslint`, `/commitlint`, `/prettier`.

## GitHub Actions

| Action                                    | Inputs                         | What it does                                                                    |
| ----------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `rxova/shared/actions/setup-pnpm`         | `node-version`, `registry-url` | pnpm from `packageManager` (install cached) and Node with the pnpm store cached |
| `rxova/shared/actions/turbo-cache`        | `key`                          | Restores and saves `.turbo` per job; pass `key` per matrix leg                  |
| `rxova/shared/actions/turbo-remote-cache` | —                              | A Turbo remote cache backed by the Actions cache, per task hash                 |
| `rxova/shared/actions/setup-playwright`   | `browsers`                     | Installs Playwright browsers, cached by Playwright version                      |
