/** What the context nudge tells the agent at each level of fullness. */
export const nudgeMessage = (band: number): string =>
  band >= 2
    ? 'rx-ai: the context window is over 80% full. Finish the current step, write a handoff note ' +
      '(rx-handoff skill), then suggest the user runs /compact or starts a new session from the note.'
    : 'rx-ai: the context window is about 60% full. At the next natural break (a slice done, before ' +
      'a new area), write a handoff note (rx-handoff skill) and suggest the user runs /compact.';
