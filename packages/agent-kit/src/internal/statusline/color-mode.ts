import type { ColorMode } from "@/internal/statusline/statusline.types";

/**
 * How many colours to use: none with `NO_COLOR` set, 24-bit when `COLORTERM` says so or
 * `RX_STATUSLINE_COLOR=truecolor` asks for it, otherwise the 256-colour palette every terminal
 * has. `RX_STATUSLINE_COLOR` (`truecolor`, `256` or `none`) overrides the guess.
 */
export const colorMode = (env: Readonly<Record<string, string | undefined>>): ColorMode => {
  const wanted = env.RX_STATUSLINE_COLOR;
  if (wanted === "truecolor" || wanted === "256" || wanted === "none") return wanted;
  if (env.NO_COLOR !== undefined && env.NO_COLOR !== "") return "none";
  return env.COLORTERM === "truecolor" || env.COLORTERM === "24bit" ? "truecolor" : "256";
};
