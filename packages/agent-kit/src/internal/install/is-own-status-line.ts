import { isRecord } from "@/internal/install/is-record";

/** Whether a `statusLine` setting runs this kit's installed script. */
export const isOwnStatusLine = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.command === "string" &&
  /[\\/]rx-ai[\\/]statusline\.sh"?(\s|$)/.test(value.command);
