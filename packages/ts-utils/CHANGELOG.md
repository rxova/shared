# @rxova/ts-utils

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
