import { baseVitestConfig } from '@rxova/repo-config/vitest';

// `src/react.ts` is the second entry's barrel: re-exports only, like index.ts.
export default baseVitestConfig({ root: import.meta.dirname, exclude: ['src/react.ts'] });
