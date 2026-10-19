import { describe, expect, it } from "vitest";
import { commandUsage } from "@/internal/cli/command-usage";

const load = () => Promise.resolve(() => 0);

describe("commandUsage", () => {
  it("shows how to call the command, then what it does", () => {
    expect(
      commandUsage("statusline", { summary: "only the status line", flags: "[--x]", load }),
    ).toBe("usage: rxova-agent-kit statusline [--x]\n\n  only the status line");
  });

  it("leaves the options out for a command that takes none", () => {
    expect(commandUsage("go", { summary: "goes", load })).toBe(
      "usage: rxova-agent-kit go\n\n  goes",
    );
  });
});
