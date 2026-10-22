import { describe, expect, it } from "vitest";
import { mapValues } from "@/object/map-values";

describe("mapValues", () => {
  it("passes every value, and its key, through the transform", () => {
    expect(mapValues({ a: 1, b: 2 }, (value, key) => `${key}${String(value * 10)}`)).toEqual({
      a: "a10",
      b: "b20",
    });
  });

  it("returns a new object and leaves the input alone", () => {
    const input = { a: 1 };
    const output = mapValues(input, (value) => value + 1);
    expect(output).not.toBe(input);
    expect(input).toEqual({ a: 1 });
  });

  it("keeps own string keys only", () => {
    const inherited: Record<string, number> = Object.create({ up: 1 }) as Record<string, number>;
    inherited.own = 2;
    Object.defineProperty(inherited, Symbol("hidden"), { value: 3, enumerable: true });
    expect(mapValues(inherited, (value) => value)).toEqual({ own: 2 });
  });

  it("keeps a __proto__ key as data, not as the prototype", () => {
    const input = JSON.parse('{"__proto__":{"polluted":true}}') as Record<string, unknown>;
    const output = mapValues(input, (value) => value);
    expect(Object.getPrototypeOf(output)).toBe(Object.prototype);
    expect(Object.hasOwn(output, "__proto__")).toBe(true);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});
