/** The program a word names, without its directory: `/usr/bin/git` → `git`. */
export const programName = (word: string): string => word.slice(word.lastIndexOf('/') + 1);
