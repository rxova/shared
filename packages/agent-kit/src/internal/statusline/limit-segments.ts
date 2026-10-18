import type {
  Run,
  Segment,
  StatusFacts,
  StatusInput,
} from "@/internal/statusline/statusline.types";
import { formatDuration } from "@/internal/statusline/format-duration";
import { formatUsd } from "@/internal/statusline/format-usd";
import { gauge } from "@/internal/statusline/gauge";
import { heatColor } from "@/internal/statusline/heat-color";
import { joinRuns } from "@/internal/statusline/join-runs";
import { limitPace } from "@/internal/statusline/limit-pace";
import { run } from "@/internal/statusline/run";
import { THEME } from "@/internal/statusline/theme";

const SPACE = run(THEME.dim, " ");

/** The third line: each rate limit with its pace and reset, the spend limit, then session details. */
export const limitSegments = (input: StatusInput, facts: StatusFacts): Segment[] => {
  const { now } = facts;
  const label = (text: string) => run(THEME.label, text);
  const dim = (text: string) => run(THEME.dim, text);

  const limits = input.limits.map((limit, index): Segment => {
    const heat = heatColor(limit.usedPercentage);
    const bar = gauge(limit.usedPercentage / 100, 10);
    const pace = limitPace({ ...limit, now });
    const left = limit.resetsAt === undefined ? undefined : limit.resetsAt - now;
    const parts: Run[][] = [
      [label(limit.label.toUpperCase())],
      [run(heat, bar.filled), run(THEME.track, bar.empty)],
      [run(heat, `${String(Math.round(limit.usedPercentage))}%`, true)],
      left === undefined || left <= 0 ? [] : [dim(`↺ ${formatDuration(left)}`)],
      pace?.exhaustsIn === undefined
        ? pace === undefined
          ? []
          : [dim(`${pace.pace.toFixed(1)}×`)]
        : [run(THEME.warn, `⚠ out in ${formatDuration(pace.exhaustsIn)}`, true)],
    ];
    return { runs: joinRuns(parts, SPACE), priority: 9 - index };
  });

  let spend: Run[] = [];
  if (input.spend !== undefined) {
    const { usedUsd, limitUsd, period, usedPercentage } = input.spend;
    spend = joinRuns(
      [
        [label("SPEND")],
        usedUsd === undefined
          ? []
          : [
              run(THEME.cost, formatUsd(usedUsd), true),
              ...(limitUsd === undefined ? [] : [dim(`/${formatUsd(limitUsd)}`)]),
            ],
        [run(heatColor(usedPercentage), `${String(Math.round(usedPercentage))}%`, true)],
        period === undefined ? [] : [dim(period)],
      ],
      SPACE,
    );
  }

  const meta = joinRuns(
    [
      input.agent === undefined ? [] : [run(THEME.model, `@${input.agent}`)],
      input.vimMode === undefined ? [] : [run(THEME.dirty, input.vimMode, true)],
      input.outputStyle === undefined || input.outputStyle === "default"
        ? []
        : [dim(`✎ ${input.outputStyle}`)],
      input.addedDirs > 0 ? [dim(`+${String(input.addedDirs)} dirs`)] : [],
      input.sessionName === undefined ? [] : [dim(`“${input.sessionName}”`)],
      input.version === undefined ? [] : [dim(`v${input.version}`)],
    ],
    SPACE,
  );

  return [...limits, { runs: spend, priority: 7 }, { runs: meta, priority: 2 }];
};
