/**
 * `base...head`, for git's range arguments. Either end that starts with a dash
 * is refused: git would read it as an option, and an option in that position
 * (`--upload-pack=…`, say) can run a command. The values come from CI, but a
 * gate that trusts its inputs is a gate someone will eventually feed.
 */
export const revisionRange = (base: string, head: string): string => {
  for (const revision of [base, head]) {
    if (revision.startsWith("-")) {
      throw new Error(`revision "${revision}" starts with a dash, which git reads as an option`);
    }
  }
  return `${base}...${head}`;
};
