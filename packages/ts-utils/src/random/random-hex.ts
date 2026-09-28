import { notifiedFallbacks } from "@/internal/random/notified-fallbacks";
import { toHex } from "@/internal/random/to-hex";
import type { RandomHexOptions } from "@/random/random-hex.types";

/**
 * `bytes` random bytes as lowercase hex, so the string is `2 * bytes` long.
 *
 * `crypto.getRandomValues`, deliberately, not `crypto.randomUUID`: `randomUUID`
 * exists only in secure contexts, so it is undefined on a plain-http origin (an
 * intranet app, a LAN staging box), while `getRandomValues` works there, in
 * workers, Node, Deno and Bun. Where even that is missing (an exotic host with
 * no polyfill) the bytes come from `Math.random` rather than the call throwing,
 * and `onFallback` is told once, because an id that quietly stops being
 * unpredictable is worse than one that says so.
 *
 * `getRandomValues` fills at most 65,536 bytes per call; ids never come close.
 */
export const randomHex = (bytes: number, { onFallback }: RandomHexOptions = {}): string => {
  if (!Number.isInteger(bytes) || bytes < 0) {
    throw new RangeError(`randomHex: bytes must be a non-negative integer, got ${String(bytes)}`);
  }

  const crypto = (globalThis as { crypto?: Partial<Crypto> }).crypto;
  if (typeof crypto?.getRandomValues === "function") {
    return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), toHex).join("");
  }

  if (onFallback !== undefined && !notifiedFallbacks.has(onFallback)) {
    notifiedFallbacks.add(onFallback);
    onFallback();
  }
  return Array.from({ length: bytes }, () => toHex(Math.floor(Math.random() * 256))).join("");
};
