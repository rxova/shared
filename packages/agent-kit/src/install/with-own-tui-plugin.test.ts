import { describe, expect, it } from "vitest";
import { withOwnTuiPlugin } from "@/install/with-own-tui-plugin";

const DIR = "/home/me/.config/opencode/plugin/rx-statusline";

describe("withOwnTuiPlugin", () => {
  it("adds the kit's plugin as the directory URL OpenCode takes", () => {
    expect(withOwnTuiPlugin({}, DIR)).toEqual({ plugins: [`file://${DIR}`] });
  });

  it("keeps everyone else's plugins, in their order", () => {
    expect(withOwnTuiPlugin({ plugins: ["a", "b"] }, DIR)).toEqual({
      plugins: ["a", "b", `file://${DIR}`],
    });
  });

  it("replaces its own entry rather than adding a second", () => {
    const once = withOwnTuiPlugin({ plugins: ["a"] }, DIR);
    expect(withOwnTuiPlugin(once, DIR)).toEqual({ plugins: ["a", `file://${DIR}`] });
  });

  it("removes only its own entry when asked for none", () => {
    expect(withOwnTuiPlugin({ plugins: ["a", `file://${DIR}`] }, undefined)).toEqual({
      plugins: ["a"],
    });
  });

  it("drops an empty plugins key rather than leaving one behind", () => {
    expect(withOwnTuiPlugin({ plugins: [`file://${DIR}`] }, undefined)).toEqual({});
    expect(withOwnTuiPlugin({ theme: "x", plugins: [`file://${DIR}`] }, undefined)).toEqual({
      theme: "x",
    });
  });

  it("leaves the rest of the config untouched", () => {
    expect(withOwnTuiPlugin({ theme: "dark" }, DIR)).toEqual({
      theme: "dark",
      plugins: [`file://${DIR}`],
    });
  });

  it("survives a plugins key that is not a list", () => {
    expect(withOwnTuiPlugin({ plugins: "oops" }, DIR)).toEqual({ plugins: [`file://${DIR}`] });
  });
});
