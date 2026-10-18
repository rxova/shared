import type { Rgb } from "@/internal/statusline/statusline.types";

/** `rgb` as `#rrggbb`, which is how OpenTUI takes a colour. */
export const hexColor = ([r, g, b]: Rgb): string =>
  `#${[r, g, b]
    .map((channel) =>
      Math.max(0, Math.min(255, Math.round(channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
