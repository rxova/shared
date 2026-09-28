import { join } from "node:path";
import { isRecord } from "@/internal/install/is-record";
import { readJson } from "@/internal/install/read-json";

/** `<target>/settings.json` as an object; empty when the file does not exist. */
export const readSettings = (target: string): Record<string, unknown> => {
  const value = readJson(join(target, "settings.json"));
  if (value === undefined) return {};
  if (!isRecord(value)) throw new Error(`${join(target, "settings.json")} is not a JSON object`);
  return value;
};
