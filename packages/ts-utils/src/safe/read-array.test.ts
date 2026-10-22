import { describe, expect, it, vi } from "vitest";
import { readArray } from "@/safe/read-array";

const readString = (item: unknown): string | undefined =>
  typeof item === "string" ? item : undefined;

describe("readArray", () => {
  it("reads every item and keeps their order", () => {
    expect(readArray(["a", "b"], readString)).toEqual(["a", "b"]);
  });

  it("gives the reader each item's index", () => {
    const readItem = vi.fn((item: unknown, index: number) => `${String(item)}@${String(index)}`);
    expect(readArray(["a", "b"], readItem)).toEqual(["a@0", "b@1"]);
  });

  it("rejects the whole list when one item fails, by default", () => {
    expect(readArray(["a", 1, "b"], readString)).toBeUndefined();
  });

  it("stops reading at the first failure it rejects on", () => {
    const readItem = vi.fn(readString);
    readArray(["a", 1, "b"], readItem);
    expect(readItem).toHaveBeenCalledTimes(2);
  });

  it("keeps the readable items with onInvalid: skip", () => {
    expect(readArray(["a", 1, "b"], readString, { onInvalid: "skip" })).toEqual(["a", "b"]);
    expect(readArray([1, 2], readString, { onInvalid: "skip" })).toEqual([]);
  });

  it("tells an absent list from an empty one", () => {
    expect(readArray([], readString)).toEqual([]);
    expect(readArray(undefined, readString)).toBeUndefined();
    expect(readArray({ length: 1 }, readString)).toBeUndefined();
    expect(readArray("ab", readString)).toBeUndefined();
  });

  it("reads nothing from a proxy that throws or has been revoked", () => {
    const hostile = new Proxy(["a", "b"], {
      get: (target, key, receiver) => {
        if (key === "1") throw new Error("no");
        return Reflect.get(target, key, receiver) as unknown;
      },
    });
    expect(readArray(hostile, readString)).toBeUndefined();
    const revoked = Proxy.revocable([], {});
    revoked.revoke();
    expect(readArray(revoked.proxy, readString)).toBeUndefined();
  });
});
