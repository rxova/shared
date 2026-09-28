export { isObjectLike } from "@/predicates/is-object-like";
export { isRecord } from "@/predicates/is-record";
export { isPlainObject } from "@/predicates/is-plain-object";
export { tryRead } from "@/safe/try-read";
export type { ReadResult } from "@/safe/try-read.types";
export { readProperty } from "@/safe/read-property";
export { readString } from "@/safe/read-string";
export { hasProperty } from "@/safe/has-property";
export { safeKeys } from "@/safe/safe-keys";
export { isInstanceOf } from "@/safe/is-instance-of";
export { objectTag } from "@/safe/object-tag";
export { arrayItems } from "@/safe/array-items";
export { isError } from "@/errors/is-error";
export { errorMessage } from "@/errors/error-message";
export { shallowEqual } from "@/equality/shallow-equal";
export { isDevelopment } from "@/env/is-development";
export { createDevWarner } from "@/dev-warner/create-dev-warner";
export type {
  DevWarner,
  DevWarnerOptions,
  WarnOptions,
} from "@/dev-warner/create-dev-warner.types";
export { canUseDOM } from "@/dom/can-use-dom";
export { deepFreeze } from "@/freeze/deep-freeze";
export { clamp } from "@/number/clamp";
export { isNonProduction } from "@/env/is-non-production";
export type { BundlerEnv, NonProductionOptions } from "@/env/is-non-production.types";
export { isErrorLike } from "@/errors/is-error-like";
export { randomHex } from "@/random/random-hex";
export type { RandomHexOptions } from "@/random/random-hex.types";
export { escapeHtml } from "@/string/escape-html";
export { prefersReducedMotion } from "@/dom/prefers-reduced-motion";
