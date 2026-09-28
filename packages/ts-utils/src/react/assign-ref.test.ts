import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { assignRef } from "@/react/assign-ref";

describe("assignRef", () => {
  it("calls a callback ref", () => {
    const ref = vi.fn();
    expect(assignRef(ref, "node")).toBeUndefined();
    expect(ref).toHaveBeenCalledWith("node");
  });

  it("returns the cleanup a callback ref gives back", () => {
    const cleanup = vi.fn();
    expect(assignRef(() => cleanup, "node")).toBe(cleanup);
  });

  it("sets an object ref", () => {
    const ref = createRef<string>();
    assignRef(ref, "node");
    expect(ref.current).toBe("node");
    assignRef(ref, null);
    expect(ref.current).toBeNull();
  });

  it("skips a missing ref", () => {
    expect(assignRef(null, "node")).toBeUndefined();
    expect(assignRef(undefined, "node")).toBeUndefined();
  });
});
