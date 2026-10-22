/**
 * `JSON.stringify(value)` with every object's keys in sorted order, so two
 * documents that differ only in key order produce the same string — the form
 * to compare, hash or store as a fingerprint.
 *
 * It is `JSON.stringify` in every other respect, deliberately: `toJSON` runs
 * first (a `Date` becomes its ISO string before anything is sorted),
 * `undefined`, functions and symbols are dropped from objects and become
 * `null` in arrays, `NaN` and the infinities become `null`, and a cycle throws
 * a `TypeError`. A top-level `undefined` returns `undefined`, as it does
 * there. Array order is data and is never touched.
 *
 * Keys sort by UTF-16 code unit, the order `Array.prototype.sort` gives and
 * the one RFC 8785 specifies — close enough to read a hash in another
 * language, though no claim of certified JCS conformance is made here.
 * Postgres `jsonb` uses its own order and will not match either way.
 */
export const stableStringify = (value: unknown): string | undefined => {
  const seen = new Set<object>();

  const write = (input: unknown, key: string): string | undefined => {
    const held =
      typeof (input as { toJSON?: unknown } | null | undefined)?.toJSON === "function"
        ? (input as { toJSON: (key: string) => unknown }).toJSON(key)
        : input;

    if (held === null || typeof held !== "object") return JSON.stringify(held);

    if (seen.has(held))
      throw new TypeError("stableStringify: converting circular structure to JSON");
    seen.add(held);
    try {
      if (Array.isArray(held)) {
        const items = held.map((item, index) => write(item, String(index)) ?? "null");
        return `[${items.join(",")}]`;
      }
      const fields = Object.keys(held)
        .sort()
        .flatMap((name) => {
          const written = write((held as Record<string, unknown>)[name], name);
          return written === undefined ? [] : [`${JSON.stringify(name)}:${written}`];
        });
      return `{${fields.join(",")}}`;
    } finally {
      seen.delete(held);
    }
  };

  return write(value, "");
};
