import { describe, expect, it, vi } from "vitest";
import { installWithRetries } from "@/internal/publish/install-with-retries";

describe("installWithRetries", () => {
  it("retries until the install succeeds", () => {
    let calls = 0;
    const sleep = vi.fn();
    const log = vi.fn();
    installWithRetries(
      () => {
        calls += 1;
        if (calls < 3) throw new Error("ETARGET");
      },
      { sleep, log },
    );
    expect(calls).toBe(3);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledWith(
      "post-publish-smoke: install attempt 1 failed; retrying\nETARGET",
    );
  });

  it("gives up after the last attempt with npm's error", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    expect(() => {
      installWithRetries(
        () => {
          throw new Error("E404");
        },
        { attempts: 2, sleep: () => {} },
      );
    }).toThrow("the published packages did not install from npm:\nE404");
    log.mockRestore();
  });
});
