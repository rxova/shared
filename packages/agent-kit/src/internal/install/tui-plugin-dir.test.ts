import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { tuiPluginDir } from "@/internal/install/tui-plugin-dir";

describe("tuiPluginDir", () => {
  it("is the folder the plugin file sits in, not the file", () => {
    expect(tuiPluginDir("/home/me/.config/opencode")).toBe(
      join("/home/me/.config/opencode", "plugin", "rx-statusline"),
    );
  });

  it("follows the target it is given", () => {
    expect(tuiPluginDir("/w/.opencode")).toBe(join("/w/.opencode", "plugin", "rx-statusline"));
  });
});
