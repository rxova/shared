---
"@rxova/repo-config": minor
---

One Prettier preset for every rxova repository: semicolons, double quotes, `trailingComma: "all"`, `arrowParens: "always"`, `printWidth: 100`, and `prettier-plugin-astro` built in with the `*.astro` override. `@rxova/repo-config/prettier` is now a JavaScript module (it was JSON); `.prettierrc` keeps `"@rxova/repo-config/prettier"`. Every consumer reformats once. `prettier-plugin-astro` is a dependency so consumers do not install it. New `@rxova/repo-config/lint-staged`: re-export it from `lint-staged.config.js`.
