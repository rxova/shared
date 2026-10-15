import type { Segment, StatusFacts, StatusInput } from "@/internal/statusline/statusline.types";
import { formatDuration } from "@/internal/statusline/format-duration";
import { formatUsd } from "@/internal/statusline/format-usd";
import { gauge } from "@/internal/statusline/gauge";
import { heatColor } from "@/internal/statusline/heat-color";
import { limitPace } from "@/internal/statusline/limit-pace";
import { paint } from "@/internal/statusline/paint";
import { THEME } from "@/internal/statusline/theme";

/** The third line: each rate limit with its pace and reset, the spend limit, then session details. */
export const limitSegments = (input: StatusInput, facts: StatusFacts): Segment[] => {
  const { mode, now } = facts;
  const label = (text: string) => paint(THEME.label, text, mode);
  const dim = (text: string) => paint(THEME.dim, text, mode);

  const limits = input.limits.map((limit, index): Segment => {
    const heat = heatColor(limit.usedPercentage);
    const bar = gauge(limit.usedPercentage / 100, 10);
    const pace = limitPace({ ...limit, now });
    const left = limit.resetsAt === undefined ? undefined : limit.resetsAt - now;
    const parts = [
      label(limit.label.toUpperCase()),
      paint(heat, bar.filled, mode) + paint(THEME.track, bar.empty, mode),
      paint(heat, `${String(Math.round(limit.usedPercentage))}%`, mode, true),
      left === undefined || left <= 0 ? "" : dim(`↺ ${formatDuration(left)}`),
      pace?.exhaustsIn === undefined
        ? pace === undefined
          ? ""
          : dim(`${pace.pace.toFixed(1)}×`)
        : paint(THEME.warn, `⚠ out in ${formatDuration(pace.exhaustsIn)}`, mode, true),
    ];
    return { text: parts.filter((part) => part !== "").join(" "), priority: 9 - index };
  });

  let spend = "";
  if (input.spend !== undefined) {
    const { usedUsd, limitUsd, period, usedPercentage } = input.spend;
    spend = [
      label("SPEND"),
      usedUsd === undefined
        ? ""
        : paint(THEME.cost, formatUsd(usedUsd), mode, true) +
          (limitUsd === undefined ? "" : dim(`/${formatUsd(limitUsd)}`)),
      paint(heatColor(usedPercentage), `${String(Math.round(usedPercentage))}%`, mode, true),
      period === undefined ? "" : dim(period),
    ]
      .filter((part) => part !== "")
      .join(" ");
  }

  const meta = [
    input.agent === undefined ? "" : paint(THEME.model, `@${input.agent}`, mode),
    input.vimMode === undefined ? "" : paint(THEME.dirty, input.vimMode, mode, true),
    input.outputStyle === undefined || input.outputStyle === "default"
      ? ""
      : dim(`✎ ${input.outputStyle}`),
    input.addedDirs > 0 ? dim(`+${String(input.addedDirs)} dirs`) : "",
    input.sessionName === undefined ? "" : dim(`“${input.sessionName}”`),
    input.version === undefined ? "" : dim(`v${input.version}`),
  ]
    .filter((part) => part !== "")
    .join(" ");

  return [...limits, { text: spend, priority: 7 }, { text: meta, priority: 2 }];
};
