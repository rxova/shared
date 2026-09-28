import { describe, expect, it, vi } from "vitest";
import { consoleIo } from "@/internal/cli/console-io";

describe("consoleIo", () => {
  it("writes out to console.log and err to console.error", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      consoleIo.out("a");
      consoleIo.err("b");
      expect(log).toHaveBeenCalledWith("a");
      expect(error).toHaveBeenCalledWith("b");
    } finally {
      log.mockRestore();
      error.mockRestore();
    }
  });
});
