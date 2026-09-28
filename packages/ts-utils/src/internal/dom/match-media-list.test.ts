import { afterEach, describe, expect, it, vi } from "vitest";
import { matchMediaList } from "@/internal/dom/match-media-list";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("matchMediaList", () => {
  it("is undefined without a DOM", () => {
    expect(matchMediaList("(min-width: 1px)")).toBeUndefined();
  });

  it("is undefined where matchMedia is missing", () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", {});
    expect(matchMediaList("(min-width: 1px)")).toBeUndefined();
  });

  it("calls matchMedia on the window with the query", () => {
    const list = { matches: true };
    const matchMedia = vi.fn(() => list);
    const window = { matchMedia };
    vi.stubGlobal("window", window);
    vi.stubGlobal("document", {});
    expect(matchMediaList("(min-width: 1px)")).toBe(list);
    expect(matchMedia).toHaveBeenCalledWith("(min-width: 1px)");
    expect(matchMedia.mock.contexts[0]).toBe(window);
  });
});
