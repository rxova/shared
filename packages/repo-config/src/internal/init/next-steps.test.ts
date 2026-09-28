import { describe, expect, it } from "vitest";
import { nextSteps } from "@/internal/init/next-steps";

describe("nextSteps", () => {
  it("names the repository for the npm trusted publisher", () => {
    expect(nextSteps({ owner: "ada", name: "idea" }, true).join("\n")).toContain(
      "repository ada/idea, workflow release.yml",
    );
  });

  it("adds the Pages step only when init could not do it", () => {
    expect(nextSteps({ owner: "a", name: "b" }, true).join("\n")).not.toContain("Pages");
    expect(nextSteps({ owner: "a", name: "b" }, false).join("\n")).toContain("Pages");
  });
});
