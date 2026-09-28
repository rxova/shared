import { describe, expect, it, vi } from "vitest";
import { fakeDist, fakeHtml, fakeTwin } from "@/check/check.fixtures";
import { checkMdRoutesCommand } from "@/check/check-md-routes-command";

const io = () => ({ out: vi.fn(), err: vi.fn() });

describe("checkMdRoutesCommand", () => {
  it("passes a sound build and says how many twins it read", async () => {
    const dir = await fakeDist({ "a/index.html": fakeHtml(), "a.md": fakeTwin("a") });
    const streams = io();
    expect(await checkMdRoutesCommand([dir], streams)).toBe(0);
    expect(streams.out).toHaveBeenCalledWith(
      "✔ 1 markdown twin(s), no unhandled markup, no dangling links",
    );
  });

  it("fails with the list of problems", async () => {
    const dir = await fakeDist({ "a/index.html": fakeHtml(), "b.md": fakeTwin("b", "<Tabs>") });
    const streams = io();
    expect(await checkMdRoutesCommand([dir], streams)).toBe(1);
    expect(streams.err).toHaveBeenCalledWith(
      [
        "2 markdown-route problem(s):",
        "  ✗ a/index.html has no markdown twin at a.md",
        '  ✗ b.md contains an unhandled Starlight/MDX component: "<Tabs"',
      ].join("\n"),
    );
  });

  it("passes the flags through", async () => {
    const dir = await fakeDist({
      "index.html": fakeHtml(),
      "play/index.html": fakeHtml(),
      "a.md": fakeTwin("a", "<Live />"),
      "llms.txt": "x".repeat(2048),
      "llms-full.txt": "x".repeat(2048),
    });
    const streams = io();
    expect(
      await checkMdRoutesCommand(
        [
          dir,
          "--untwinned",
          "index.html, play/",
          "--components",
          "Live",
          "--max-full",
          "1k",
          "--max-index",
          "1024",
        ],
        streams,
      ),
    ).toBe(1);
    const report = String(streams.err.mock.calls[0]?.[0]);
    expect(report).toContain("3 markdown-route problem(s)");
    expect(report).toContain('"<Live"');
    expect(report).toContain("llms-full.txt is 2 kB, over the 1 kB budget");
    expect(report).toContain("llms.txt is 2 kB, over the 1 kB budget");
  });

  it("reads ./dist by default", async () => {
    const dir = await fakeDist({ "dist/a/index.html": fakeHtml(), "dist/a.md": fakeTwin("a") });
    const cwd = vi.spyOn(process, "cwd").mockReturnValue(dir);
    try {
      expect(await checkMdRoutesCommand([], io())).toBe(0);
    } finally {
      cwd.mockRestore();
    }
  });

  it("refuses an unknown flag or an unreadable size with exit 2", async () => {
    const streams = io();
    expect(await checkMdRoutesCommand(["--nope"], streams)).toBe(2);
    expect(await checkMdRoutesCommand(["--max-full", "big"], streams)).toBe(2);
    expect(streams.err).toHaveBeenLastCalledWith(
      'rxova-docs-kit check-md-routes: --max-full takes a size such as 800k, not "big"',
    );
  });

  it("writes to the console by default", async () => {
    const dir = await fakeDist({});
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    try {
      expect(await checkMdRoutesCommand([dir])).toBe(0);
      expect(log).toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
