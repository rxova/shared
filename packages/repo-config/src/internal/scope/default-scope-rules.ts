import type { ScopeRules } from "@/scope/scope.types";

/**
 * `repoConfig.scope` when a repository writes none. Markdown anywhere counts as
 * documentation, except below a package's top level (a package that ships
 * Markdown as content, a template or a prompt, has tests that read it) and in
 * test and fixture folders. A package's README and CHANGELOG sit at its top
 * level, so they stay documentation.
 */
export const DEFAULT_SCOPE_RULES: ScopeRules = {
  ignore: ["**/*.md", "**/*.mdx"],
  keep: ["packages/*/*/**", "**/{test,tests,__tests__,fixtures,__fixtures__}/**"],
  site: ["apps/docs/**"],
};
