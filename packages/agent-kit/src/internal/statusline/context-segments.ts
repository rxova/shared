import type { Segment, StatusFacts, StatusInput } from "@/internal/statusline/statusline.types";
import { formatDuration } from "@/internal/statusline/format-duration";
import { formatTokens } from "@/internal/statusline/format-tokens";
import { formatUsd } from "@/internal/statusline/format-usd";
import { gauge } from "@/internal/statusline/gauge";
import { heatColor } from "@/internal/statusline/heat-color";
import { paint } from "@/internal/statusline/paint";
import { sparkline } from "@/internal/statusline/sparkline";
import { THEME } from "@/internal/statusline/theme";
import { turnsLeft } from "@/internal/statusline/turns-left";

/** The second line: the context gauge and its trend, the prompt cache, cost and time. */
export const contextSegments = (input: StatusInput, facts: StatusFacts): Segment[] => {
  const { mode, now } = facts;
  const label = (text: string) => paint(THEME.label, text, mode);
  const dim = (text: string) => paint(THEME.dim, text, mode);

  const tokens = input.contextTokens ?? 0;
  const percent = input.contextSize > 0 ? (tokens / input.contextSize) * 100 : 0;
  const heat = heatColor(percent);
  const bar = gauge(percent / 100, 16);
  const context = [
    label("CTX"),
    paint(heat, bar.filled, mode) + paint(THEME.track, bar.empty, mode),
    paint(heat, `${String(Math.round(percent))}%`, mode, true),
    dim(`${formatTokens(tokens)}/${formatTokens(input.contextSize)}`),
  ].join(" ");

  const turns = turnsLeft(facts.history, input.contextSize);
  const trend = [
    facts.history.length > 1 ? paint(heat, sparkline(facts.history.slice(-12)), mode) : "",
    turns === undefined ? "" : dim(`≈${String(turns)} turns`),
  ]
    .filter((part) => part !== "")
    .join(" ");

  let cache = "";
  if (input.cache !== undefined) {
    const { hitRatio, expiresAt, warm, ttl } = input.cache;
    const left = expiresAt === undefined ? undefined : expiresAt - now;
    cache = [
      label("CACHE"),
      hitRatio === undefined
        ? ""
        : paint(THEME.cache, `${String(Math.round(hitRatio * 100))}%`, mode, true),
      warm && left !== undefined && left > 0
        ? paint(left < 60 ? THEME.warn : THEME.cache, `⏲ ${formatDuration(left)}`, mode)
        : dim(warm ? `warm${ttl === undefined ? "" : ` ${ttl}`}` : "cold"),
    ]
      .filter((part) => part !== "")
      .join(" ");
  }

  const hours = (input.durationMs ?? 0) / 3_600_000;
  const cost =
    input.costUsd === undefined
      ? ""
      : paint(THEME.cost, formatUsd(input.costUsd), mode, true) +
        (hours * 60 >= 1 && input.costUsd > 0 ? dim(` ${formatUsd(input.costUsd / hours)}/h`) : "");

  const time =
    input.durationMs === undefined
      ? ""
      : paint(THEME.text, `◷ ${formatDuration(input.durationMs / 1000)}`, mode) +
        (input.apiDurationMs !== undefined && input.durationMs > 0
          ? dim(` api ${String(Math.round((input.apiDurationMs / input.durationMs) * 100))}%`)
          : "");

  return [
    { text: context, priority: 10 },
    { text: cost, priority: 8 },
    { text: cache, priority: 6 },
    { text: trend, priority: 5 },
    { text: time, priority: 4 },
  ];
};
