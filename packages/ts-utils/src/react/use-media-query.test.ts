// @vitest-environment happy-dom
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@/react/render-hook.fixtures";
import { useMediaQuery } from "@/react/use-media-query";

/** A controllable `matchMedia`: one list per query, flipped by `set`. */
const fakeMatchMedia = (initial: boolean) => {
  let matches = initial;
  const listeners = new Set<() => void>();
  const list = {
    get matches() {
      return matches;
    },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  };
  const matchMedia = vi.fn(() => list);
  vi.stubGlobal("matchMedia", matchMedia);
  return {
    matchMedia,
    listeners,
    set: (next: boolean) => {
      matches = next;
      act(() => {
        listeners.forEach((listener) => {
          listener();
        });
      });
    },
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMediaQuery", () => {
  it("reads the query and follows changes", () => {
    const media = fakeMatchMedia(true);
    const { result, unmount } = renderHook(({ query }) => useMediaQuery(query), {
      query: "(min-width: 600px)",
    });
    expect(result.current).toBe(true);
    expect(media.matchMedia).toHaveBeenCalledWith("(min-width: 600px)");

    media.set(false);
    expect(result.current).toBe(false);

    unmount();
    expect(media.listeners.size).toBe(0);
  });

  it("re-subscribes when the query changes", () => {
    const media = fakeMatchMedia(false);
    const { rerender } = renderHook(({ query }) => useMediaQuery(query), { query: "(a)" });
    rerender({ query: "(b)" });
    expect(media.matchMedia).toHaveBeenCalledWith("(b)");
    expect(media.listeners.size).toBe(1);
  });

  it("falls back to the server value where matchMedia is missing", () => {
    vi.stubGlobal("matchMedia", undefined);
    const { result, unmount } = renderHook(() => useMediaQuery("(a)", true), undefined);
    expect(result.current).toBe(true);
    unmount();
  });

  it("renders the server value on the server", () => {
    fakeMatchMedia(true);
    const Probe = () => createElement("i", null, String(useMediaQuery("(a)")));
    expect(renderToString(createElement(Probe))).toBe("<i>false</i>");
  });
});
