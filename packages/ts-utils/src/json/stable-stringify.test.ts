import { describe, expect, it } from "vitest";
import { stableStringify } from "@/json/stable-stringify";

describe("stableStringify", () => {
  it("sorts the keys of every object, however deep", () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: [{ f: 3, e: 4 }] } })).toBe(
      '{"a":{"c":[{"e":4,"f":3}],"d":2},"b":1}',
    );
  });

  it("gives two documents written in different orders the same string", () => {
    expect(stableStringify({ a: 1, b: 2 })).toBe(stableStringify({ b: 2, a: 1 }));
  });

  it("keeps array order, which is data", () => {
    expect(stableStringify([3, 1, 2])).toBe("[3,1,2]");
  });

  it("sorts by UTF-16 code unit, so capitals come first", () => {
    expect(stableStringify({ a: 1, B: 2, ä: 3, A: 4 })).toBe('{"A":4,"B":2,"a":1,"ä":3}');
  });

  it("matches JSON.stringify on primitives and on what JSON drops", () => {
    expect(stableStringify("x")).toBe('"x"');
    expect(stableStringify(1)).toBe("1");
    expect(stableStringify(null)).toBe("null");
    expect(stableStringify(undefined)).toBeUndefined();
    expect(stableStringify(() => 1)).toBeUndefined();
    expect(stableStringify({ a: undefined, b: () => 1, c: Symbol("s"), d: 1 })).toBe('{"d":1}');
    expect(stableStringify([undefined, () => 1, 1])).toBe("[null,null,1]");
    expect(stableStringify({ a: Number.NaN, b: Number.POSITIVE_INFINITY })).toBe(
      '{"a":null,"b":null}',
    );
  });

  it("escapes a key the way JSON does", () => {
    expect(stableStringify({ 'a"b': 1 })).toBe('{"a\\"b":1}');
  });

  it("runs toJSON first, so a Date is its string before anything is sorted", () => {
    const when = new Date("2026-10-22T00:00:00.000Z");
    expect(stableStringify({ b: when, a: 1 })).toBe('{"a":1,"b":"2026-10-22T00:00:00.000Z"}');
  });

  it("passes the key to toJSON, as JSON.stringify does", () => {
    const value = { toJSON: (key: string) => `at:${key}` };
    expect(stableStringify({ b: value })).toBe('{"b":"at:b"}');
    expect(stableStringify([value])).toBe('["at:0"]');
    expect(stableStringify(value)).toBe('"at:"');
  });

  it("throws on a cycle, as JSON.stringify does", () => {
    const loop: Record<string, unknown> = {};
    loop.self = loop;
    expect(() => stableStringify(loop)).toThrow(TypeError);
  });

  it("allows the same object twice when it is not a cycle", () => {
    const shared = { a: 1 };
    expect(stableStringify([shared, shared])).toBe('[{"a":1},{"a":1}]');
  });

  it("walks a class instance key by key when it has no toJSON", () => {
    class Point {
      constructor(
        readonly y: number,
        readonly x: number,
      ) {}
    }
    expect(stableStringify(new Point(2, 1))).toBe('{"x":1,"y":2}');
  });
});
