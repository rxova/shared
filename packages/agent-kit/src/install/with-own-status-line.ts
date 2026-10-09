import { withoutOwnStatusLine } from "@/install/without-own-status-line";

/**
 * A settings object whose `statusLine` runs the kit's script at `script`, or, when `script` is
 * undefined, without the kit's `statusLine`. Someone else's is replaced only when a script is
 * given; the caller decides whether that is allowed.
 */
export const withOwnStatusLine = (
  settings: Record<string, unknown>,
  script: string | undefined,
): Record<string, unknown> =>
  script === undefined
    ? withoutOwnStatusLine(settings)
    : { ...settings, statusLine: { type: "command", command: `bash "${script}"` } };
