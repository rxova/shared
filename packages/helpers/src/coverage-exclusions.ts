/**
 * Every function lives in `src/<function-name>.ts`, its tests in
 * `<function-name>.test.ts`, its types in `<name>.types.ts`, and fakes that
 * several suites share in `<name>.fixtures.ts`, which is test code. `index.ts`
 * is a re-export barrel and a `.types.ts` file is types only; neither has
 * executable lines worth a threshold. Logic that lands in either one is logic
 * the thresholds cannot see, so keep them to re-exports and types.
 */
export const COVERAGE_EXCLUSIONS = [
  'src/**/*.test.{ts,tsx}',
  'src/**/*.fixtures.{ts,tsx}',
  'src/**/*.types.ts',
  'src/index.ts',
] as const;
