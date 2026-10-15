/**
 * How fast a rate limit window is being spent: `pace` is the share used over the share of the
 * window gone (above 1 runs out before the reset), and `exhaustsIn` the seconds until 100% at
 * that rate when that comes before the reset. Undefined until a twentieth of the window has
 * passed, when the rate means little.
 */
export const limitPace = ({
  usedPercentage,
  resetsAt,
  windowSeconds,
  now,
}: {
  usedPercentage: number;
  resetsAt?: number | undefined;
  windowSeconds: number;
  now: number;
}): { pace: number; exhaustsIn?: number } | undefined => {
  if (resetsAt === undefined) return undefined;
  const left = resetsAt - now;
  const elapsed = windowSeconds - left;
  if (left <= 0 || elapsed < windowSeconds / 20 || usedPercentage <= 0) return undefined;
  const pace = usedPercentage / ((elapsed / windowSeconds) * 100);
  const exhaustsIn = ((100 - usedPercentage) / usedPercentage) * elapsed;
  return exhaustsIn < left ? { pace, exhaustsIn: Math.max(0, exhaustsIn) } : { pace };
};
