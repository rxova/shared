import type { Step } from '@/config/config.types';

/**
 * The steps named by `--only a,b` (or `--only=a,b`), in the list's order. An
 * unknown name throws: a typo that silently ran nothing would read as a pass.
 */
export const selectSteps = (steps: Step[], argv: readonly string[]): Step[] => {
  const flag = argv.find((arg) => arg === '--only' || arg.startsWith('--only='));
  if (flag === undefined) return steps;

  const value = flag.includes('=')
    ? flag.slice(flag.indexOf('=') + 1)
    : argv[argv.indexOf(flag) + 1];
  const wanted = (value ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
  if (wanted.length === 0) throw new Error('--only needs a comma-separated list of step names');

  const known = new Set(steps.map((step) => step.name));
  const unknown = wanted.filter((name) => !known.has(name));
  if (unknown.length > 0) {
    throw new Error(
      `unknown step(s): ${unknown.join(', ')}; the steps are ${[...known].join(', ')}`,
    );
  }
  return steps.filter((step) => wanted.includes(step.name));
};
