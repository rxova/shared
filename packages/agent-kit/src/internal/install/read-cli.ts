import { join } from "node:path";
import { isRecord } from "@/internal/install/is-record";
import { readJson } from "@/internal/install/read-json";

/** `<root>/cli.json` as an object; empty when it does not exist or holds anything else. */
export const readCli = (root: string): Record<string, unknown> => {
  const value = readJson(join(root, "cli.json"));
  return isRecord(value) ? value : {};
};
