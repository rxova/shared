const ATTRIBUTION = [
  /^\s*co-authored-by:.*\b(claude|anthropic)\b/i,
  /^\s*claude-session:/i,
  /generated with \[?claude/i,
  /🤖/u,
  /claude\.ai\/code/i,
  /\bsession_[A-Za-z0-9]{6,}/,
];

/** Whether a line credits Claude: a co-author trailer, a session link or the generated-with footer. */
export const carriesAttribution = (line: string): boolean =>
  ATTRIBUTION.some((pattern) => pattern.test(line));
