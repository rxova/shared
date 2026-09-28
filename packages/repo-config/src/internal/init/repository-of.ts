import type { Repository } from "@/init/init.types";

/**
 * The GitHub repository a manifest's `repository` points at, from any of the
 * forms npm accepts: `git+https://github.com/o/r.git`, `git@github.com:o/r`,
 * `github:o/r`, or the bare `o/r` shorthand.
 */
export const repositoryOf = (repository: unknown): Repository => {
  const url =
    typeof repository === "string"
      ? repository
      : typeof repository === "object" && repository !== null && "url" in repository
        ? String(repository.url)
        : "";
  const match =
    /github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(url) ??
    /^(?:github:)?([\w.-]+)\/([\w.-]+)$/.exec(url);
  if (!match?.[1] || !match[2]) {
    throw new Error(`package.json#repository does not name a GitHub repository: "${url}"`);
  }
  return { owner: match[1], name: match[2] };
};
