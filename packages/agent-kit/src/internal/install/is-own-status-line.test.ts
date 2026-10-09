import { describe, expect, it } from "vitest";
import { isOwnStatusLine } from "@/internal/install/is-own-status-line";

describe("isOwnStatusLine", () => {
  it("knows the script on any platform, quoted or not", () => {
    expect(isOwnStatusLine({ command: 'bash "/home/a/.claude/rx-ai/statusline.sh"' })).toBe(true);
    expect(isOwnStatusLine({ command: "bash C:\\Users\\a\\.claude\\rx-ai\\statusline.sh" })).toBe(
      true,
    );
  });

  it("passes other commands and values", () => {
    expect(isOwnStatusLine({ command: "bash ~/.claude/statusline-command.sh" })).toBe(false);
    expect(isOwnStatusLine({ command: 1 })).toBe(false);
    expect(isOwnStatusLine("bash /x/rx-ai/statusline.sh")).toBe(false);
    expect(isOwnStatusLine(undefined)).toBe(false);
  });
});
