import { isRecord } from "@/internal/install/is-record";

/** Whether a `statusLine` setting runs this kit's installed script, or the older bash one. */
export const isOwnStatusLine = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.command === "string" &&
  /[\\/]rx-ai[\\/]statusline\.(js|sh)"?(\s|$)/.test(value.command);
