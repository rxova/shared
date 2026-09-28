---
title: Getting started
description: Add the shared packages and actions to a repository.
---

## Runtime helpers

```sh
pnpm add -D @rxova/ts-utils
```

```ts
import { errorMessage, isRecord } from "@rxova/ts-utils";
```

Add it as a dev dependency of a published package so its build inlines the helpers. The package
stays dependency-free.

## Repository tooling

```sh
pnpm add -D @rxova/repo-config
```

```json
{
  "scripts": {
    "verify": "rxova-repo-config verify"
  }
}
```

```js
// eslint.config.js
import { rxova } from "@rxova/repo-config/eslint";
export default rxova({ tsconfigRootDir: import.meta.dirname, node: true, tests: true });
```

```json
// .prettierrc
"@rxova/repo-config/prettier"
```

```json
// tsconfig.json
{ "extends": "@rxova/repo-config/tsconfig.react.json", "include": ["src"] }
```

```ts
// tsdown.config.ts
import { defineConfig } from "tsdown";
import { dualBuildConfig } from "@rxova/repo-config/tsdown";
export default defineConfig(dualBuildConfig());
```

## GitHub Actions

```yaml
steps:
  - uses: actions/checkout@v7
  - uses: rxova/shared/actions/setup-pnpm@main
  - uses: rxova/shared/actions/turbo-cache@main
  - run: pnpm install --frozen-lockfile
```

Whole jobs come from the reusable workflows, and the gate from `require-jobs`:

```yaml
jobs:
  commitlint:
    uses: rxova/shared/.github/workflows/commit-messages.yml@main
  changeset:
    needs: [commitlint]
    uses: rxova/shared/.github/workflows/changeset-gate.yml@main
  gate:
    name: all checks
    if: always()
    needs: [commitlint, changeset]
    runs-on: ubuntu-latest
    steps:
      - uses: rxova/shared/actions/require-jobs@main
        with:
          needs: ${{ toJSON(needs) }}
```

Renovate takes the org preset:

```json5
// .github/renovate.json5
{ extends: ['github>rxova/shared//renovate/default.json5'] }
```

Every export, command and action input is listed in the [reference](../../reference/api/).
