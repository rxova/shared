import type { KnipWorkspace } from "@/knip/knip.types";

/**
 * `extra` over `base`: a key both hold as a list gets both lists, every other
 * key takes `extra`'s value.
 */
export const mergeWorkspace = (base: KnipWorkspace, extra: KnipWorkspace): KnipWorkspace =>
  Object.fromEntries(
    Object.entries({ ...base, ...extra }).map(([key, value]) => {
      const before: unknown = (base as Record<string, unknown>)[key];
      return [
        key,
        Array.isArray(before) && Array.isArray(value) && before !== value
          ? [...(before as unknown[]), ...(value as unknown[])]
          : value,
      ];
    }),
  );
