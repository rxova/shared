import type {
  Run,
  Segment,
  StatusFacts,
  StatusInput,
} from "@/internal/statusline/statusline.types";
import { formatDuration } from "@/internal/statusline/format-duration";
import { formatTokens } from "@/internal/statusline/format-tokens";
import { formatUsd } from "@/internal/statusline/format-usd";
import { gauge } from "@/internal/statusline/gauge";
import { heatColor } from "@/internal/statusline/heat-color";
import { joinRuns } from "@/internal/statusline/join-runs";
import { run } from "@/internal/statusline/run";
import { sparkline } from "@/internal/statusline/sparkline";
import { THEME } from "@/internal/statusline/theme";
import { turnsLeft } from "@/internal/statusline/turns-left";

const SPACE = run(THEME.dim, " ");

/** The second line: the context gauge and its trend, the prompt cache, cost and time. */
export const contextSegments = (input: StatusInput, facts: StatusFacts): Segment[] => {
  const { now } = facts;
  const label = (text: string) => run(THEME.label, text);
  const dim = (text: string) => run(THEME.dim, text);

  const tokens = input.contextTokens ?? 0;
  const percent = input.contextSize > 0 ? (tokens / input.contextSize) * 100 : 0;
  const heat = heatColor(percent);
  const bar = gauge(percent / 100, 16);
  const context = joinRuns(
    [
      [label("CTX")],
      [run(heat, bar.filled), run(THEME.track, bar.empty)],
      [run(heat, `${String(Math.round(percent))}%`, true)],
      [dim(`${formatTokens(tokens)}/${formatTokens(input.contextSize)}`)],
    ],
    SPACE,
  );

  const turns = turnsLeft(facts.history, input.contextSize);
  const trend = joinRuns(
    [
      facts.history.length > 1 ? [run(heat, sparkline(facts.history.slice(-12)))] : [],
      turns === undefined ? [] : [dim(`≈${String(turns)} turns`)],
    ],
    SPACE,
  );

  let cache: Run[] = [];
  if (input.cache !== undefined) {
    const { hitRatio, expiresAt, warm, ttl } = input.cache;
    const left = expiresAt === undefined ? undefined : expiresAt - now;
    cache = joinRuns(
      [
        [label("CACHE")],
        hitRatio === undefined
          ? []
          : [run(THEME.cache, `${String(Math.round(hitRatio * 100))}%`, true)],
        warm && left !== undefined && left > 0
          ? [run(left < 60 ? THEME.warn : THEME.cache, `⏲ ${formatDuration(left)}`)]
          : [dim(warm ? `warm${ttl === undefined ? "" : ` ${ttl}`}` : "cold")],
      ],
      SPACE,
    );
  }

  const hours = (input.durationMs ?? 0) / 3_600_000;
  const cost =
    input.costUsd === undefined
      ? []
      : [
          run(THEME.cost, formatUsd(input.costUsd), true),
          ...(hours * 60 >= 1 && input.costUsd > 0
            ? [dim(` ${formatUsd(input.costUsd / hours)}/h`)]
            : []),
        ];

  const time =
    input.durationMs === undefined
      ? []
      : [
          run(THEME.text, `◷ ${formatDuration(input.durationMs / 1000)}`),
          ...(input.apiDurationMs !== undefined && input.durationMs > 0
            ? [dim(` api ${String(Math.round((input.apiDurationMs / input.durationMs) * 100))}%`)]
            : []),
        ];

  return [
    { runs: context, priority: 10 },
    { runs: cost, priority: 8 },
    { runs: cache, priority: 6 },
    { runs: trend, priority: 5 },
    { runs: time, priority: 4 },
  ];
};
