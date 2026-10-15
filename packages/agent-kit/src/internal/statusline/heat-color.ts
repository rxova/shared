import type { Rgb } from "@/internal/statusline/statusline.types";

/** Green through yellow and orange to red as `percent` climbs from 0 to 100. */
export const heatColor = (percent: number): Rgb => {
  const stops: readonly { at: number; rgb: Rgb }[] = [
    { at: 0, rgb: [166, 227, 161] },
    { at: 50, rgb: [249, 226, 175] },
    { at: 75, rgb: [250, 179, 135] },
    { at: 90, rgb: [243, 139, 168] },
  ];
  const at = Math.min(100, Math.max(0, percent));
  const first = { at: 0, rgb: [166, 227, 161] } as const;
  let low: { at: number; rgb: Rgb } = first;
  let high: { at: number; rgb: Rgb } = first;
  for (const stop of stops) {
    if (stop.at <= at) low = stop;
    if (stop.at >= at && high.at < at) high = stop;
  }
  if (high.at < at) high = low;
  const share = high.at === low.at ? 0 : (at - low.at) / (high.at - low.at);
  const mix = (channel: 0 | 1 | 2) =>
    Math.round(low.rgb[channel] + (high.rgb[channel] - low.rgb[channel]) * share);
  return [mix(0), mix(1), mix(2)];
};
