# @rxova/ts-utils

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
