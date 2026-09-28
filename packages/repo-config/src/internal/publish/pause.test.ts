import { describe, expect, it } from "vitest";
import { pause } from "@/internal/publish/pause";

describe("pause", () => {
  it("waits at least as long as asked", () => {
    const start = performance.now();
    pause(20);
    expect(performance.now() - start).toBeGreaterThanOrEqual(15);
  });
});
