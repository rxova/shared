import type { BinCheck } from "@/config/config.types";
import { assertOnlyKeys } from "@/internal/config/assert-only-keys";
import { compact } from "@/internal/config/compact";
import { failConfig } from "@/internal/config/fail-config";
import { isRecord } from "@/internal/config/is-record";
import { readString } from "@/internal/config/read-string";
import { readStrings } from "@/internal/config/read-strings";

/** `packSmoke.bins`: `false`, or `{ args, expect? }` by bin name. */
export const parseBinChecks = (
  value: unknown,
  path: string,
): false | Record<string, BinCheck> | undefined => {
  if (value === undefined || value === false) return value;
  if (!isRecord(value)) return failConfig(path, "false or an object of { args, expect? } by bin");
  return Object.fromEntries(
    Object.keys(value).map((bin) => {
      const at = `${path}.${bin}`;
      const check = value[bin];
      if (!isRecord(check)) return failConfig(at, "an object");
      assertOnlyKeys(check, at, ["args", "expect"]);
      return [
        bin,
        compact<BinCheck>({
          args: readStrings(check, "args", at) ?? [],
          expect: readString(check, "expect", at),
        }),
      ];
    }),
  );
};
