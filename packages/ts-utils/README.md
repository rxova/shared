<h1 align="center">@rxova/ts-utils</h1>

<p align="center">Small, dependency-free runtime helpers for the rxova packages, inlined at build time.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@rxova/ts-utils"><img src="https://img.shields.io/npm/v/@rxova/ts-utils?color=cb3837&logo=npm&logoColor=white" alt="npm version" /></a>
  <a href="https://github.com/rxova/shared/actions/workflows/ci.yml"><img src="https://github.com/rxova/shared/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="No dependencies" />
  <img src="https://img.shields.io/badge/target-es2020-f7df1e" alt="Built to es2020" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#rxovats-utils">Core</a> ·
  <a href="#rxovats-utilsreact">React</a> ·
  <a href="#notes">Notes</a>
</p>

The helpers every package ends up writing, written once and tested hard: type guards that never
throw on a hostile proxy, the message to show for anything thrown, development warnings a bundler
can drop, a media query hook that does not tear. Browser and Node alike, no side effects, built to
es2020, so a consumer's bundler inlines the few it uses and ships nothing else.

```ts
import { errorMessage, isRecord } from "@rxova/ts-utils";

try {
  JSON.parse(input);
} catch (error) {
  report(errorMessage(error)); // a string, whatever was thrown
}
```

## What you get

|                     |                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| 🔍 **Guards**       | `isObjectLike`, `isRecord`, `isPlainObject`, `isError`, `isErrorLike`: the checks, named once.                  |
| 🛡️ **Safe reads**   | Property reads, `in`, `Object.keys` and `instanceof` that survive throwing getters and proxy traps.             |
| 🌱 **Environment**  | `isDevelopment` for output, `isNonProduction` for behaviour, `canUseDOM`, `prefersReducedMotion`.               |
| ⚠️ **Dev warnings** | `createDevWarner`: a prefix, stable codes linked to docs, warn-once.                                            |
| 🧮 **Values**       | `shallowEqual`, `deepFreeze`, `clamp`, `escapeHtml`, `randomHex`.                                               |
| ⚛️ **React**        | `/react`: an isomorphic layout effect, latest-value and merged refs, a media query hook, per-instance warnings. |
| 📦 **Zero cost**    | No dependencies, `sideEffects: false`, ESM: what you do not import is not in the bundle.                        |

## Install

In an rxova repository, add it once, to the root `package.json`, as a dev dependency:

```sh
pnpm add -D -w @rxova/ts-utils
```

`@rxova/ts-utils` is declared only in the root `package.json`, never in a published package's
`dependencies`. The package's build inlines the helpers it imports: `reactBuildConfig` from
`@rxova/repo-config/tsdown` sets `deps.onlyBundle: ["@rxova/ts-utils"]`, which bundles ts-utils and
fails the build on any other dependency. The published package stays dependency-free and inside its
size budget. A package built with another tsdown preset sets the same:

```ts
// packages/<name>/tsdown.config.ts
import { defineConfig } from "tsdown";
import { dualBuildConfig } from "@rxova/repo-config/tsdown";

export default defineConfig(dualBuildConfig({ deps: { onlyBundle: ["@rxova/ts-utils"] } }));
```

`react` (18 or newer) is an optional peer dependency; only `@rxova/ts-utils/react` imports it.

## Quick start

```ts
import { createDevWarner, isRecord, readString } from "@rxova/ts-utils";

const warner = createDevWarner({ prefix: "my-package", docsUrl: "https://example.com/warnings" });

export const parseOptions = (value: unknown): string | undefined => {
  if (!isRecord(value)) {
    if (process.env.NODE_ENV !== "production") {
      warner.warnOnce("options", "options must be an object", { code: "MP1001" });
    }
    return undefined;
  }
  return readString(value, "label");
};
```

```tsx
import { useMediaQuery, useMergedRefs } from "@rxova/ts-utils/react";
import { useRef, type Ref } from "react";

export const Panel = ({ ref }: { ref?: Ref<HTMLDivElement> }) => {
  const own = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  return <div ref={useMergedRefs(own, ref)} data-animate={!reduced} />;
};
```

## `@rxova/ts-utils`

**Guards**

| Export                 | What it answers                                                                 |
| ---------------------- | ------------------------------------------------------------------------------- |
| `isObjectLike(value)`  | Any non-null object, arrays and class instances included.                       |
| `isRecord(value)`      | A non-null, non-array object. Class instances pass.                             |
| `isPlainObject(value)` | An object literal, `JSON.parse` result or `Object.create(null)` bag.            |
| `isError(value)`       | A real `Error`, from this realm or another. `{ message }` alone does not count. |
| `isErrorLike(value)`   | Any object whose `message` is a string. A throwing getter makes it `false`.     |

**Safe reads** — never let a getter, a proxy trap or `Symbol.hasInstance` throw

| Export                       | Returns                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `tryRead(value, key)`        | `{ ok: true, value }`, or `{ ok: false }` when the read threw.       |
| `readProperty(value, key)`   | The property, or `undefined` when reading it throws.                 |
| `readString(value, key)`     | The property when it is a string, else `undefined`.                  |
| `hasProperty(value, key)`    | `key in value`, `false` when a proxy refuses.                        |
| `safeKeys(value)`            | `Object.keys`, `[]` when a proxy refuses.                            |
| `isInstanceOf(value, Class)` | `instanceof`, `false` when it throws.                                |
| `objectTag(value)`           | `"[object Map]"` and friends, across realms; `undefined` if refused. |
| `arrayItems(value)`          | A copy of an array, else `undefined`.                                |

**Errors, environment and DOM**

| Export                                       | What it does                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `errorMessage(value)`                        | The text to show for anything thrown: an `Error`'s message, a string, else `String()`. Never throws.               |
| `isDevelopment()`                            | A boolean `__DEV__` global wins; otherwise `NODE_ENV !== "production"`.                                            |
| `isNonProduction({ bundlerEnv?, nodeEnv? })` | Conservative: `PROD`/`DEV` of the passed `import.meta.env`, then a string `NODE_ENV`; nothing known means `false`. |
| `canUseDOM()`                                | Whether both `window` and `document` exist.                                                                        |
| `prefersReducedMotion()`                     | The reduced-motion media query, now. `false` on the server or without `matchMedia`.                                |

**Values**

| Export                              | What it does                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `shallowEqual(a, b)`                | `Object.is` for each own key. `{ a: undefined }` is not equal to `{ b: undefined }`.                                                 |
| `deepFreeze(value)`                 | Freezes the value and everything reachable from it, Map and Set entries included. Skips typed arrays and DataViews, survives cycles. |
| `clamp(value, min, max)`            | `value` kept within `[min, max]`. NaN stays NaN; a reversed range throws a `RangeError`.                                             |
| `escapeHtml(value)`                 | `& < > " '` as entities, for HTML or XML text and quoted attributes. Not a sanitizer.                                                |
| `randomHex(bytes, { onFallback? })` | `2 * bytes` lowercase hex digits from `crypto.getRandomValues`; `Math.random` fallback, reported once through `onFallback`.          |

**Development warnings**

`createDevWarner(options)` returns `{ warn, warnOnce, format, reset }` for one package:

| Option    | Default         | Effect                                                          |
| --------- | --------------- | --------------------------------------------------------------- |
| `prefix`  | —               | Required. Every line starts `[prefix]`.                         |
| `docsUrl` | None            | With a `code`, the line links `<docsUrl>#<code in lower case>`. |
| `enabled` | `isDevelopment` | Read on every call.                                             |
| `sink`    | `console.warn`  | Where a warning goes.                                           |

| Method                                       | Does                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| `warn(message, { code?, detail? })`          | Warns every time. `detail` is logged as its own argument.                      |
| `warnOnce(key, message, { code?, detail? })` | Warns the first time `key` is seen, so a render loop cannot flood the console. |
| `format(message, code?)`                     | The line a warning prints, without printing it.                                |
| `reset()`                                    | Forgets every key `warnOnce` has seen. For tests.                              |

```ts
const warner = createDevWarner({ prefix: "otp", docsUrl: "https://example.com/warnings" });
warner.warn("length must be positive", { code: "OTP1001" });
// [otp] OTP1001: length must be positive
//   → https://example.com/warnings#otp1001
```

Types: `ReadResult`, `DevWarner`, `DevWarnerOptions`, `WarnOptions`, `BundlerEnv`,
`NonProductionOptions`, `RandomHexOptions`.

## `@rxova/ts-utils/react`

| Export                                                  | What it is                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `useIsomorphicLayoutEffect`                             | `useLayoutEffect` when a `document` exists, `useEffect` on the server.                                        |
| `useLatestRef(value)`                                   | A stable ref holding the latest committed value, written in a layout effect.                                  |
| `assignRef(ref, value)`                                 | Hands a value to a callback or object ref; returns a React 19 ref cleanup.                                    |
| `useMergedRefs(...refs)`                                | One callback ref that feeds every ref given; stable while they are.                                           |
| `useMediaQuery(query, serverValue = false)`             | A media query kept current with `useSyncExternalStore`; `serverValue` on the server and without `matchMedia`. |
| `useDevWarner({ prefix, docsUrl?, enabled?, onWarn? })` | `createDevWarner` per component instance; `onWarn(detail)` replaces the console.                              |

Types: `UseDevWarnerOptions`.

## Notes

- **Dead-code elimination.** `isDevelopment` reads `process.env.NODE_ENV` literally, so a bundler
  can replace it. To drop a warning's text from a production bundle, guard the call site itself
  with `if (process.env.NODE_ENV !== "production")`.
- **`isRecord` rejects arrays.** Code that meant "any object" should use `isObjectLike`; code that
  must reject a `Date` or a `Map` should use `isPlainObject`.
- **Two development checks.** `isDevelopment` is permissive (an unset `NODE_ENV` is development),
  for output such as warnings. `isNonProduction` is conservative (an unknown environment is
  production), for behaviour with a cost, such as switching on a devtools bridge. Pass it
  `{ bundlerEnv: import.meta.env }` from the call site; passing `nodeEnv`, even as `undefined`,
  stops it reading `process.env.NODE_ENV`. To keep warnings out of tests as well, pass
  `createDevWarner({ prefix, enabled: () => isDevelopment() && process.env.NODE_ENV !== "test" })`.
- **`useDevWarner` and `detail`.** The `detail` given to `warn`/`warnOnce` goes to `onWarn` as its
  only argument, so a component's `onWarn(warning)` prop can be passed straight in; without
  `onWarn` the console gets the formatted line alone. `onWarn` and `enabled` are read from the
  latest render, `prefix` and `docsUrl` from the first. Keep the production guard at the call site,
  `if (process.env.NODE_ENV !== "production") warner.warnOnce(…)`, so the message text is dropped.

## License

[MIT](LICENSE)
