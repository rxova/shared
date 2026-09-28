/** The guards named in `RX_AI_OFF`, a comma-separated list. */
export const switchedOff = (value: string | undefined): Set<string> =>
  new Set(
    (value ?? "")
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== ""),
  );
