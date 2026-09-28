// @vitest-environment happy-dom
import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { renderHook } from "@/react/render-hook.fixtures";
import { useLatestRef } from "@/react/use-latest-ref";

describe("useLatestRef", () => {
  it("starts with the first value and follows every commit", () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), { value: 1 });
    expect(result.current.current).toBe(1);
    rerender({ value: 2 });
    expect(result.current.current).toBe(2);
  });

  it("is the same ref on every render", () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), { value: "a" });
    const first = result.current;
    rerender({ value: "b" });
    expect(result.current).toBe(first);
  });

  it("is up to date before passive effects read it", () => {
    const seen: number[] = [];
    const { rerender } = renderHook(
      ({ value }) => {
        const ref = useLatestRef(value);
        useEffect(() => {
          seen.push(ref.current);
        });
      },
      { value: 1 },
    );
    rerender({ value: 2 });
    expect(seen).toEqual([1, 2]);
  });
});
