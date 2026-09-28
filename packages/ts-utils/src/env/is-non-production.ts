import type { NonProductionOptions } from "@/env/is-non-production.types";
import { isObjectLike } from "@/predicates/is-object-like";

// Typed here so the package needs no Node types: it runs in browsers too.
declare const process: { env: { NODE_ENV?: string } };

const ambientNodeEnv = (): string | undefined => {
  // Literal and inside a try, for the reason `isDevelopment` gives: bundlers
  // replace this exact expression, and an unbundled browser has no `process`.
  try {
    return process.env.NODE_ENV;
  } catch {
    return undefined;
  }
};

/**
 * Whether the environment has positively said it is not production — the
 * question to ask before switching on something with a runtime cost, such as a
 * devtools bridge.
 *
 * Conservative where `isDevelopment` is permissive: a bundler's `PROD === true`
 * says no and `DEV === true` says yes; otherwise a string `NODE_ENV` decides
 * (anything but `production` is yes); and when nothing answers, the answer is
 * **no**, because an environment that never said it was safe is treated as a
 * shipped app. Permissive for output, conservative for behaviour.
 *
 * Passing `nodeEnv`, even as `undefined`, means "I have looked": the ambient
 * `process.env.NODE_ENV` is not read.
 */
export const isNonProduction = (options: NonProductionOptions = {}): boolean => {
  const { bundlerEnv } = options;
  if (isObjectLike(bundlerEnv)) {
    if (bundlerEnv.PROD === true) return false;
    if (bundlerEnv.DEV === true) return true;
  }
  const nodeEnv = "nodeEnv" in options ? options.nodeEnv : ambientNodeEnv();
  return typeof nodeEnv === "string" && nodeEnv !== "production";
};
