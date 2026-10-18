import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { opencodeFacts } from "@/statusline/opencode-facts";

const NOW = 1_800_000_000;
const dir = mkdtempSync(join(tmpdir(), "rx-oc-facts-"));
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});
const noGit = () => undefined;
const status = (branch: string) => () => `# branch.head ${branch}\n`;

describe("opencodeFacts", () => {
  it("leaves the working tree out when the directory is not a repository", () => {
    expect(opencodeFacts({ cwd: "/w" }, NOW, noGit, dir).git).toBeUndefined();
  });

  it("reads the working tree through the runner it is given", () => {
    expect(opencodeFacts({ cwd: "/w" }, NOW, status("main"), dir).git?.branch).toBe("main");
  });

  it("keeps the colour out, because the cells carry hex", () => {
    expect(opencodeFacts({}, NOW, noGit, dir).mode).toBe("none");
  });

  it("leaves room at the edge of the terminal", () => {
    expect(opencodeFacts({ columns: 100 }, NOW, noGit, dir).columns).toBe(96);
  });

  it("assumes a usable width when the host reports none", () => {
    expect(opencodeFacts({}, NOW, noGit, dir).columns).toBe(116);
  });

  it("never asks for a width below one column", () => {
    expect(opencodeFacts({ columns: 1 }, NOW, noGit, dir).columns).toBe(1);
  });

  it("records the window over the session, so the trend has something to draw", () => {
    const session = { sessionId: "trend", tokens: { input: 10 } };
    expect(opencodeFacts(session, NOW, noGit, dir).history).toEqual([10]);
    expect(opencodeFacts({ ...session, tokens: { input: 20 } }, NOW, noGit, dir).history).toEqual([
      10, 20,
    ]);
  });

  it("passes the clock it is given through to the rows", () => {
    expect(opencodeFacts({}, NOW, noGit, dir).now).toBe(NOW);
  });
  it("reads the clock and the working tree itself when given neither", () => {
    const facts = opencodeFacts({ sessionId: "" });
    expect(facts.now).toBeGreaterThan(1_700_000_000);
    expect(facts.mode).toBe("none");
    expect(facts.history).toEqual([]);
  });
});
