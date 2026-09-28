/**
 * The label that says a pull request needs no changelog entry.
 *
 * A dependency bump changes what the repository builds *with* and nothing about
 * what it publishes, so the gate has nothing to ask for — and a gate that asks
 * anyway teaches people to write empty changesets. Renovate applies this
 * label to every pull request it opens. `[skip-changeset]` in the title does
 * the same for a pull request whose author cannot set labels.
 */
export const SKIP_LABEL = "skip-changeset";
