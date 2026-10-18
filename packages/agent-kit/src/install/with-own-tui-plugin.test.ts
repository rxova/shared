import { describe, expect, it } from "vitest";
import { pathToFileURL } from "node:url";
import { withOwnTuiPlugin } from "@/install/with-own-tui-plugin";

const DIR = "/home/me/.config/opencode/plugin/rx-statusline";
const URL_ = pathToFileURL(DIR).href;

describe("withOwnTuiPlugin", () => {
  it("adds the kit's plugin as the directory URL OpenCode takes", () => {
    expect(withOwnTuiPlugin({}, DIR)).toEqual({ plugins: [URL_] });
  });

  it("keeps everyone else's plugins, in their order", () => {
    expect(withOwnTuiPlugin({ plugins: ["a", "b"] }, DIR)).toEqual({
      plugins: ["a", "b", URL_],
    });
  });

  it("replaces its own entry rather than adding a second", () => {
    const once = withOwnTuiPlugin({ plugins: ["a"] }, DIR);
    expect(withOwnTuiPlugin(once, DIR)).toEqual({ plugins: ["a", URL_] });
  });

  it("removes only its own entry when asked for none", () => {
    expect(withOwnTuiPlugin({ plugins: ["a", URL_] }, undefined)).toEqual({
      plugins: ["a"],
    });
  });

  it("drops an empty plugins key rather than leaving one behind", () => {
    expect(withOwnTuiPlugin({ plugins: [URL_] }, undefined)).toEqual({});
    expect(withOwnTuiPlugin({ theme: "x", plugins: [URL_] }, undefined)).toEqual({
      theme: "x",
    });
  });

  it("leaves the rest of the config untouched", () => {
    expect(withOwnTuiPlugin({ theme: "dark" }, DIR)).toEqual({
      theme: "dark",
      plugins: [URL_],
    });
  });

  it("survives a plugins key that is not a list", () => {
    expect(withOwnTuiPlugin({ plugins: "oops" }, DIR)).toEqual({ plugins: [URL_] });
  });
  it("writes a file URL, so a Windows path does not land in cli.json raw", () => {
    const [entry] = withOwnTuiPlugin({}, DIR).plugins as string[];
    expect(entry?.startsWith("file:///")).toBe(true);
    expect(entry).not.toContain("\\");
  });
});
