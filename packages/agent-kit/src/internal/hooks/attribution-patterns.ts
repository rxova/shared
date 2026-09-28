// Trailers, footers and badges that credit an AI assistant.
export const ATTRIBUTION: readonly RegExp[] = [
  /co-authored-by:[^\n]*(claude|anthropic)/i,
  /claude-session:/i,
  /generated (with|by)[^\n]{0,40}claude/i,
  /🤖/u,
];
