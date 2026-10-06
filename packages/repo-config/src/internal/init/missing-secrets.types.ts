/**
 * The rxova-bot secrets that do not reach a private repository, per kind: an
 * organisation secret reaches it when its visibility is `all` or `private`.
 */
export interface MissingSecrets {
  actions: string[];
  dependabot: string[];
}
