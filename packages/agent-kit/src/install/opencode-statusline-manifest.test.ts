import { describe, expect, it } from "vitest";
import { opencodeStatuslineManifest } from "@/install/opencode-statusline-manifest";

const manifest = () =>
  JSON.parse(opencodeStatuslineManifest()) as {
    type: string;
    exports: Record<string, string>;
    dependencies: Record<string, string>;
  };

describe("opencodeStatuslineManifest", () => {
  it("is JSON ending in a newline", () => {
    expect(opencodeStatuslineManifest().endsWith("}\n")).toBe(true);
    expect(() => JSON.parse(opencodeStatuslineManifest())).not.toThrow();
  });

  it("is an ES module, because the entries are", () => {
    expect(manifest().type).toBe("module");
  });

  it("keeps the TUI entry off the main one, which the server loads", () => {
    expect(manifest().exports).toEqual({ ".": "./server.js", "./tui": "./index.js" });
  });

  it("asks for a pinned OpenTUI line, never an open range", () => {
    const deps = manifest().dependencies;
    expect(Object.keys(deps)).toEqual(["@opentui/core", "@opentui/solid", "solid-js"]);
    // Two @opentui/core copies in one process both register OPENTUI_FORCE_UNICODE, which is
    // fatal; a `>=` range resolves to the newest major and brings exactly that.
    expect(deps["@opentui/core"]?.startsWith(">=")).toBe(false);
    expect(deps["@opentui/solid"]?.startsWith(">=")).toBe(false);
    expect(deps["@opentui/core"]).toBe(deps["@opentui/solid"]);
  });
});
