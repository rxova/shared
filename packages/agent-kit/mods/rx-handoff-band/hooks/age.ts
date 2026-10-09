/** A note's age in words: today, yesterday or n days ago. */
export const age = (days: number): string =>
  days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
