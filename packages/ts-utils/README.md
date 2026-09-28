# @rxova/ts-utils

Small runtime helpers with no dependencies, shared by the rxova packages. They work in browsers and
in Node, have no side effects, and are built to es2020, so a bundler can inline the few you use.

```sh
pnpm add -D @rxova/ts-utils
```

Add it as a **dev** dependency of a published package and let the build inline it. That way the
package keeps its zero-dependency promise and its size budget.

```ts
import { errorMessage, isRecord } from "@rxova/ts-utils";
import { useIsomorphicLayoutEffect } from "@rxova/ts-utils/react";
```

## `@rxova/ts-utils`

| Export                                       | What it answers                                                                          |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `isObjectLike(value)`                        | Any non-null object, arrays included.                                                    |
| `isRecord(value)`                            | A non-null, non-array object.                                                            |
| `isPlainObject(value)`                       | An object literal, `JSON.parse` result or `Object.create(null)` bag.                     |
| `tryRead(value, key)`                        | `{ ok, value }` for a read whose getter or proxy trap may throw.                         |
| `readProperty(value, key)`                   | The property, or `undefined` when reading it throws.                                     |
| `readString(value, key)`                     | The property when it is a string, else `undefined`.                                      |
| `hasProperty(value, key)`                    | `key in value`, `false` when a proxy refuses.                                            |
| `safeKeys(value)`                            | `Object.keys`, `[]` when a proxy refuses.                                                |
| `isInstanceOf(value, Class)`                 | `instanceof`, `false` when `Symbol.hasInstance` throws.                                  |
| `objectTag(value)`                           | `'[object Map]'` and friends, across realms.                                             |
| `arrayItems(value)`                          | A copy of an array, else `undefined`.                                                    |
| `isError(value)`                             | A real `Error`, from this realm or another. `{ message }` alone does not count.          |
| `isErrorLike(value)`                         | Any object whose `message` is a string. A throwing getter makes it `false`.              |
| `errorMessage(value)`                        | The text to show for anything thrown. Never throws.                                      |
| `shallowEqual(a, b)`                         | `Object.is` for each own key. `{ a: undefined }` is not equal to `{ b: undefined }`.     |
| `isDevelopment()`                            | A boolean `__DEV__` wins; otherwise `NODE_ENV !== 'production'`.                         |
| `isNonProduction({ bundlerEnv?, nodeEnv? })` | Conservative: `PROD`/`DEV` flags, then a string `NODE_ENV`; nothing known means `false`. |
| `createDevWarner({ prefix, docsUrl? })`      | `warn`, `warnOnce(key, …)` and `reset` for one package's development warnings.           |
| `canUseDOM()`                                | Whether both `window` and `document` exist.                                              |
| `prefersReducedMotion()`                     | The reduced-motion media query, now. `false` on the server or without `matchMedia`.      |
| `escapeHtml(value)`                          | `& < > " '` as entities, for HTML or XML text and quoted attributes.                     |
| `randomHex(bytes, { onFallback? })`          | `2 * bytes` hex digits from `crypto.getRandomValues`; `Math.random` fallback, reported.  |
| `deepFreeze(value)`                          | Freezes the value and everything reachable from it. Skips typed arrays, survives cycles. |
| `clamp(value, min, max)`                     | `value` kept within `[min, max]`. NaN stays NaN; a reversed range throws.                |

## `@rxova/ts-utils/react`

| Export                                                  | What it is                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `useIsomorphicLayoutEffect`                             | `useLayoutEffect` when a `document` exists, `useEffect` on the server.               |
| `useLatestRef(value)`                                   | A stable ref holding the latest committed value, written in a layout effect.         |
| `assignRef(ref, value)`                                 | Hands a value to a callback or object ref; returns a React 19 ref cleanup.           |
| `useMergedRefs(...refs)`                                | One callback ref that feeds every ref given; stable while they are.                  |
| `useMediaQuery(query, serverValue?)`                    | A media query kept current with `useSyncExternalStore`; `serverValue` on the server. |
| `useDevWarner({ prefix, docsUrl?, enabled?, onWarn? })` | `createDevWarner` per component instance; `onWarn(detail)` replaces the console.     |

`react` is an optional peer dependency. Only this entry point imports it.

## Notes

- **Dead-code elimination.** `isDevelopment` reads `process.env.NODE_ENV` literally, so a bundler
  can replace it. To drop a warning's text from a production bundle, guard the call site itself
  with `if (process.env.NODE_ENV !== 'production')`.
- **`isRecord` rejects arrays.** Code that meant "any object" should use `isObjectLike`.
- **Two development checks.** `isDevelopment` is permissive (an unset `NODE_ENV` is development),
  for output such as warnings. `isNonProduction` is conservative (an unknown environment is
  production), for behaviour with a cost, such as switching on a devtools bridge. To keep warnings
  out of tests as well, pass
  `createDevWarner({ prefix, enabled: () => isDevelopment() && process.env.NODE_ENV !== 'test' })`.
- **`useDevWarner` and `detail`.** The `detail` given to `warn`/`warnOnce` goes to `onWarn` as its
  only argument, so a component's `onWarn(warning)` prop can be passed straight in; without
  `onWarn` the console gets the formatted line alone. Keep the production guard at the call site,
  `if (process.env.NODE_ENV !== 'production') warner.warnOnce(…)`, so the message text is dropped.

## License

MIT
