import type { Failure } from './llms.types.ts';

export const formatLlmsFailures = (failures: Failure[]): string =>
  [
    `check:llms failed — ${String(failures.length)} problem(s)`,
    ...failures.map(({ where, reason }) => `  ✗ ${where} ${reason}`),
  ].join('\n');
