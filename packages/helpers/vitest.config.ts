// By path rather than through `@rxova/tooling/vitest`: that entry is built, and
// this package must test before anything is built.
import { baseVitestConfig } from '../tooling/src/vitest/base-vitest-config.ts';

export default baseVitestConfig({ root: import.meta.dirname });
