import { describe, expect, it, vi } from "vitest";
import { waitForRegistry } from "@/internal/publish/wait-for-registry";

const a = { name: "a", version: "1.0.0" };
const b = { name: "b", version: "1.0.0" };

describe("waitForRegistry", () => {
  it("returns at once when everything is served", () => {
    const sleep = vi.fn();
    waitForRegistry([a, b], { isPublished: () => true, sleep, now: () => 0 });
    expect(sleep).not.toHaveBeenCalled();
  });

  it("backs off until the registry catches up, asking only for what is pending", () => {
    let clock = 0;
    const asked: string[] = [];
    const served = new Set<string>();
    const sleep = vi.fn((ms: number) => {
      clock += ms;
      served.add(clock >= 5_000 ? "a" : "");
      if (clock >= 15_000) served.add("b");
    });
    const log = vi.fn();
    waitForRegistry([a, b], {
      isPublished: ({ name }) => {
        asked.push(name);
        return served.has(name);
      },
      sleep,
      now: () => clock,
      log,
    });
    expect(sleep.mock.calls).toEqual([[5_000], [10_000]]);
    expect(asked).toEqual(["a", "b", "a", "b", "b"]);
    expect(log).toHaveBeenCalledWith(
      "post-publish-smoke: waiting 5s for npm to serve a@1.0.0, b@1.0.0",
    );
  });

  it("gives up at the deadline, never sleeping past it", () => {
    let clock = 0;
    const sleep = vi.fn((ms: number) => {
      clock += ms;
    });
    expect(() => {
      waitForRegistry([a], {
        isPublished: () => false,
        sleep,
        now: () => clock,
        deadlineMs: 12_000,
        log: () => {},
      });
    }).toThrow("npm still does not serve a@1.0.0 after 12s");
    expect(sleep.mock.calls).toEqual([[5_000], [7_000]]);
  });

  it("logs to the console by default", () => {
    let clock = 0;
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const served = [false, true];
    waitForRegistry([a], {
      isPublished: () => served.shift() ?? true,
      sleep: (ms) => {
        clock += ms;
      },
      now: () => clock,
    });
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });
});
