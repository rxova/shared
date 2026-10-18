import { describe, expect, it } from "vitest";
import { isOwnTuiPlugin } from "@/internal/install/is-own-tui-plugin";

describe("isOwnTuiPlugin", () => {
  it("knows the kit's own entry, with or without a trailing slash", () => {
    expect(isOwnTuiPlugin("file:///home/me/.config/opencode/plugin/rx-statusline")).toBe(true);
    expect(isOwnTuiPlugin("file:///home/me/.config/opencode/plugin/rx-statusline/")).toBe(true);
    expect(isOwnTuiPlugin("file:///C:/Users/me/opencode/plugin/rx-statusline")).toBe(true);
  });

  it("leaves someone else's plugin alone", () => {
    expect(isOwnTuiPlugin("@rashid/other-status-line")).toBe(false);
    expect(isOwnTuiPlugin("file:///home/me/.config/opencode/plugin/their-line")).toBe(false);
    expect(isOwnTuiPlugin("file:///home/me/plugin/rx-statusline-extra")).toBe(false);
  });

  it("is false for anything that is not a string", () => {
    expect(isOwnTuiPlugin(undefined)).toBe(false);
    expect(isOwnTuiPlugin({ path: "plugin/rx-statusline" })).toBe(false);
  });
});
