import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import type Changelog from "@rxova/repo-config/changelog";

const require = createRequire(import.meta.url);
const changelog = require("@rxova/repo-config/changelog") as typeof Changelog;

const options = { repo: "rxova/shared" };
const changeset = (summary: string) => ({ id: "a", summary, releases: [] });

describe("the changelog preset", () => {
  it("keeps changelog-github's dependency line", () => {
    expect(typeof changelog.getDependencyReleaseLine).toBe("function");
  });

  it("drops the Thanks line and the empty prefix it leaves", async () => {
    const line = await changelog.getReleaseLine(
      changeset("Fix it\n\nauthor: someone\nauthor: another"),
      "patch",
      options,
    );
    expect(line).toBe("\n\n- Fix it\n");
  });

  it("leaves a line without attribution alone", async () => {
    expect(await changelog.getReleaseLine(changeset("Add it"), "minor", options)).toBe(
      "\n\n- Add it\n",
    );
  });
});
