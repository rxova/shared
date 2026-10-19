import { describe, expect, it } from "vitest";
import { usage } from "@/internal/cli/usage";

const load = () => Promise.resolve(() => 0);

describe("usage", () => {
  it("lists each command with its options, padded to the longest name", () => {
    expect(
      usage({
        go: { summary: "goes", flags: "[--fast]", load },
        statusline: { summary: "draws", flags: "[--target t]", load },
      }),
    ).toBe(
      [
        "usage: rxova-agent-kit <command> [options]",
        "",
        "  go          goes [--fast]",
        "  statusline  draws [--target t]",
      ].join("\n"),
    );
  });

  it("leaves the options off a command that takes none, with no trailing space", () => {
    expect(usage({ go: { summary: "goes", load } })).toBe(
      ["usage: rxova-agent-kit <command> [options]", "", "  go  goes"].join("\n"),
    );
  });
});
