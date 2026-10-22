# @rxova/ts-utils

## 0.3.0

### Minor Changes

- [#96](https://github.com/rxova/shared/pull/96) [`b144b95`](https://github.com/rxova/shared/commit/b144b959100b1df05805cca94a08ab40eb5750bc) - Add `isFiniteNumber`, `isNonNegativeInteger`, `sum`, `chunk`, `mapValues` and `utf8ByteLength`.

- [#102](https://github.com/rxova/shared/pull/102) [`8f8847c`](https://github.com/rxova/shared/commit/8f8847c10aca17a048ba46f7a4ebc6877ed36234) - Move `isDevelopment`, `isNonProduction` and `createDevWarner` to `@rxova/ts-utils/env`, so the
  main entry no longer references `process`. A free `process` made Next.js 16 resolve `node:process`
  and fail the build of any service worker or edge chunk that imported anything at all from the
  package. Update imports of those three to `@rxova/ts-utils/env`; everything else is unchanged.

- [#102](https://github.com/rxova/shared/pull/102) [`3c0c649`](https://github.com/rxova/shared/commit/3c0c6494ca67ffe28b57389cf2611be50e2fa306) - Add `randomBelow`, `shuffle`, `seededRandom` and `hashString`. `randomBelow` draws without bias by
  rejection sampling, where `getRandomValues(…) % bound` favours the low values; `shuffle` is
  Fisher-Yates over an injectable draw. `seededRandom` (mulberry32) and `hashString` (FNV-1a) give
  orders that come back after a reload — their sequences are part of the API and will not change.

- [#102](https://github.com/rxova/shared/pull/102) [`f61e124`](https://github.com/rxova/shared/commit/f61e124899bc14f941521a4dd96699d6e5c89389) - Add `readArray(value, readItem, { onInvalid })`: one reader for arrays of untrusted items, over a
  snapshot taken with `arrayItems`. An item `readItem` cannot read either loses the whole list
  (`reject`, the default) or just itself (`skip`).

- [#102](https://github.com/rxova/shared/pull/102) [`7465526`](https://github.com/rxova/shared/commit/7465526703c6e88bef639a1093c6268ba1701e3f) - Add `stableStringify` and `jsonEqual`: `JSON.stringify` with every object's keys sorted, for
  comparing, hashing or storing a document whose writer may order keys differently.

## 0.2.1

### Patch Changes

- [#27](https://github.com/rxova/shared/pull/27) [`13167fc`](https://github.com/rxova/shared/commit/13167fc22a3692718a5d4964848ed84b9e92f8e3) - Republish with the rewritten README, so the package page on npm shows it.

## 0.2.0

### Minor Changes

- [#21](https://github.com/rxova/shared/pull/21) [`bf85833`](https://github.com/rxova/shared/commit/bf8583362eaf65063e5ce6fac917583af140fe9c) - Add `randomHex`, `isNonProduction`, `isErrorLike`, `escapeHtml` and `prefersReducedMotion`, and to `@rxova/ts-utils/react` add `useLatestRef`, `assignRef`, `useMergedRefs`, `useMediaQuery` and `useDevWarner`.

## 0.1.0

### Minor Changes

- [#6](https://github.com/rxova/shared/pull/6) [`d8a0b89`](https://github.com/rxova/shared/commit/d8a0b894a16b95f980f723973f407462e63fdf98) - Add `@rxova/ts-utils`, a set of dependency-free runtime helpers:
  
  - object predicates and reflection that never throws;
  - `isError` and `errorMessage`;
  - `shallowEqual`;
  - `isDevelopment` and `createDevWarner`;
  - `canUseDOM`, `deepFreeze` and `clamp`;
  - `useIsomorphicLayoutEffect` under `@rxova/ts-utils/react`.

### Patch Changes

- [#8](https://github.com/rxova/shared/pull/8) [`6862335`](https://github.com/rxova/shared/commit/68623359553f1aa31c39eb42e30c0ee8105e6276) - One function per source file, named after it. No change to the exports.
