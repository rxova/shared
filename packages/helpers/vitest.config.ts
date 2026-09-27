// By path rather than through `@rxova/tooling/vitest`: that entry is built, and
// this package must test before anything is built. The preset itself reads its
// thresholds from here, so the two packages cannot drift apart.
import { baseVitestConfig } from '../tooling/src/base-vitest-config.ts';

export default baseVitestConfig();
