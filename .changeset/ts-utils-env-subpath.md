---
"@rxova/ts-utils": minor
---

Move `isDevelopment`, `isNonProduction` and `createDevWarner` to `@rxova/ts-utils/env`, so the
main entry no longer references `process`. A free `process` made Next.js 16 resolve `node:process`
and fail the build of any service worker or edge chunk that imported anything at all from the
package. Update imports of those three to `@rxova/ts-utils/env`; everything else is unchanged.
