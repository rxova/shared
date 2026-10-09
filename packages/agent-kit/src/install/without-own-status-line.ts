import { isOwnStatusLine } from "@/internal/install/is-own-status-line";

/** A settings object without this kit's `statusLine`; someone else's is kept as it was. */
export const withoutOwnStatusLine = (
  settings: Record<string, unknown>,
): Record<string, unknown> => {
  if (!isOwnStatusLine(settings.statusLine)) return settings;
  const rest = { ...settings };
  delete rest.statusLine;
  return rest;
};
