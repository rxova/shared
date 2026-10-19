import { describe, expect, it } from "vitest";
import { opencodeStatuslineServer } from "@/install/opencode-statusline-server";

describe("opencodeStatuslineServer", () => {
  it("is the shape OpenCode 2 loads: an id and a setup", () => {
    const source = opencodeStatuslineServer();
    expect(source).toContain("export default {");
    expect(source).toContain("id: 'rx-statusline'");
    expect(source).toContain("setup()");
  });

  it("imports nothing, so the server load cannot fail on a module", () => {
    expect(opencodeStatuslineServer()).not.toContain("import ");
  });

  it("touches no TUI API, which the server runtime does not have", () => {
    const source = opencodeStatuslineServer();
    expect(source).not.toContain("context.ui");
    expect(source).not.toContain("context.data");
  });
});
