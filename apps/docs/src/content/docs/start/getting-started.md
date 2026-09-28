---
title: Getting started
description: Add the shared packages and actions to a repository.
---

## Runtime helpers

```sh
pnpm add -D @rxova/ts-utils
```

```ts
import { errorMessage, isRecord } from '@rxova/ts-utils';
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
import { baseEslintConfig } from '@rxova/repo-config/eslint';
export default baseEslintConfig({ tsconfigRootDir: import.meta.dirname });
```

```json
// tsconfig.json
{ "extends": "@rxova/repo-config/tsconfig.base.json", "include": ["src"] }
```

## GitHub Actions

```yaml
steps:
  - uses: actions/checkout@v7
  - uses: rxova/shared/actions/setup-pnpm@main
  - uses: rxova/shared/actions/turbo-cache@main
  - run: pnpm install --frozen-lockfile
```

Every export, command and action input is listed in the [reference](../../reference/api/).
