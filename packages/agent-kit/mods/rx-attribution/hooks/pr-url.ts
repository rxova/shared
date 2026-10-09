const PR_URL = /https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+/;

/** The first GitHub pull request URL in a text, as gh pr create and gh pr edit print it. */
export const prUrl = (text: string): string | undefined => PR_URL.exec(text)?.[0];
