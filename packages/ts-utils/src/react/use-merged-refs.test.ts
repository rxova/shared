// @vitest-environment happy-dom
import { createElement, createRef, type Ref } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@/react/render-hook.fixtures";
import { useMergedRefs } from "@/react/use-merged-refs";

const mountSpan = (refs: Ref<HTMLSpanElement>[]) => {
  const Probe = () => createElement("span", { ref: useMergedRefs(...refs) });
  const root = createRoot(document.createElement("div"));
  act(() => {
    root.render(createElement(Probe));
  });
  return () => {
    act(() => {
      root.unmount();
    });
  };
};

describe("useMergedRefs", () => {
  it("attaches the node to object and callback refs, and detaches with null", () => {
    const objectRef = createRef<HTMLSpanElement>();
    const callbackRef = vi.fn();
    const unmount = mountSpan([objectRef, callbackRef]);

    expect(objectRef.current).toBeInstanceOf(HTMLSpanElement);
    expect(callbackRef).toHaveBeenLastCalledWith(objectRef.current);

    unmount();
    expect(objectRef.current).toBeNull();
    expect(callbackRef).toHaveBeenLastCalledWith(null);
  });

  it("runs a callback ref cleanup instead of calling it with null", () => {
    const cleanup = vi.fn();
    const callbackRef = vi.fn(() => cleanup);
    const unmount = mountSpan([callbackRef]);

    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
    expect(callbackRef).toHaveBeenCalledOnce();
  });

  it("skips missing refs", () => {
    const objectRef = createRef<HTMLSpanElement>();
    const unmount = mountSpan([objectRef, null]);
    expect(objectRef.current).toBeInstanceOf(HTMLSpanElement);
    unmount();
  });

  it("keeps its identity while the refs do, and changes it when one changes", () => {
    const a = createRef<HTMLSpanElement>();
    const b = createRef<HTMLSpanElement>();
    const { result, rerender } = renderHook(({ refs }) => useMergedRefs(...refs), { refs: [a, b] });
    const first = result.current;
    rerender({ refs: [a, b] });
    expect(result.current).toBe(first);
    rerender({ refs: [a, createRef<HTMLSpanElement>()] });
    expect(result.current).not.toBe(first);
  });
});
