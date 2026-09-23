---
title: Getting started
description: Add the shared packages and actions to a repository.
---

## Runtime helpers

```sh
pnpm add -D @rxova/toolbox
```

```ts
import { errorMessage, isRecord } from '@rxova/toolbox';
```

Add it as a dev dependency of a published package so its build inlines the helpers. The package
stays dependency-free.

## Repository tooling

```sh
pnpm add -D @rxova/tooling
```

```json
{
  "scripts": {
    "verify": "rxova-tooling verify"
  }
}
```

```js
// eslint.config.js
import { baseEslintConfig } from '@rxova/tooling/eslint';
export default baseEslintConfig({ tsconfigRootDir: import.meta.dirname });
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
