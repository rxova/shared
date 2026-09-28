---
"@rxova/repo-config": minor
---

`check-scope` also reports a documentation-only range: `code-changed=false` when every changed file is documentation under the new `repoConfig.scope` (`ignore`, default `**/*.md` and `**/*.mdx`; `keep`, default `packages/*/*/**` and test and fixture folders; none deleted), plus the new `docs-only` and `docs-changed` (`scope.site`, default `apps/docs/**`) outputs. A repository whose docs-site build is gated on `code-changed` alone should add `|| docs-changed == 'true'`; `"ignore": []` keeps the old behaviour.
