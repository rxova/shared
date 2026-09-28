import type { Failure } from "@/internal/llms/llms.types";

export const formatLlmsFailures = (failures: Failure[]): string =>
  [
    `check:llms failed — ${String(failures.length)} problem(s)`,
    ...failures.map(({ where, reason }) => `  ✗ ${where} ${reason}`),
  ].join("\n");
