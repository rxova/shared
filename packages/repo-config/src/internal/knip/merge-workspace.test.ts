import { describe, expect, it } from "vitest";
import { mergeWorkspace } from "@/internal/knip/merge-workspace";

describe("mergeWorkspace", () => {
  it("concatenates lists both sides hold and lets the other keys replace", () => {
    expect(
      mergeWorkspace(
        { ignoreDependencies: ["a"], entry: ["x.ts"], project: ["src/**"] },
        { ignoreDependencies: ["b"], entry: "y.ts" },
      ),
    ).toEqual({ ignoreDependencies: ["a", "b"], entry: "y.ts", project: ["src/**"] });
  });

  it("keeps a list only one side holds", () => {
    expect(mergeWorkspace({}, { ignore: ["z"] })).toEqual({ ignore: ["z"] });
    expect(mergeWorkspace({ ignore: ["z"] }, {})).toEqual({ ignore: ["z"] });
  });
});
