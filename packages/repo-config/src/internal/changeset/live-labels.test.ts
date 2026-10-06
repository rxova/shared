import { afterEach, describe, expect, it, vi } from "vitest";
import { liveLabels } from "@/internal/changeset/live-labels";

describe("liveLabels", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  afterEach(() => {
    log.mockClear();
  });

  it("asks gh for the current labels of PR_NUMBER and prefers them to PR_LABELS", () => {
    const tool = vi.fn(() => "dependencies,skip-changeset");
    expect(liveLabels({ PR_NUMBER: "42", PR_LABELS: "dependencies" }, tool)).toEqual([
      "dependencies",
      "skip-changeset",
    ]);
    expect(tool).toHaveBeenCalledWith("gh", [
      "pr",
      "view",
      "42",
      "--json",
      "labels",
      "--jq",
      '[.labels[].name] | join(",")',
    ]);
    expect(log).not.toHaveBeenCalled();
  });

  it("reads an unlabelled pull request as no labels, not as PR_LABELS", () => {
    expect(liveLabels({ PR_NUMBER: "42", PR_LABELS: "skip-changeset" }, () => "")).toEqual([]);
  });

  it("falls back to PR_LABELS with one notice when gh fails", () => {
    const tool = vi.fn(() => {
      throw new Error("HTTP 403");
    });
    expect(liveLabels({ PR_NUMBER: "42", PR_LABELS: "skip-changeset" }, tool)).toEqual([
      "skip-changeset",
    ]);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      "check-changeset: could not read the current labels of #42; using PR_LABELS",
    );
  });

  it("uses PR_LABELS without calling gh when PR_NUMBER is unset or empty", () => {
    const tool = vi.fn(() => "live");
    expect(liveLabels({ PR_LABELS: "a,b" }, tool)).toEqual(["a", "b"]);
    expect(liveLabels({ PR_NUMBER: "", PR_LABELS: "a" }, tool)).toEqual(["a"]);
    expect(tool).not.toHaveBeenCalled();
  });

  it("ignores a PR_NUMBER that is not digits only", () => {
    const tool = vi.fn(() => "live");
    for (const PR_NUMBER of ["12a", "-1", "1 --repo x", " 42", "#42"]) {
      expect(liveLabels({ PR_NUMBER, PR_LABELS: "a" }, tool)).toEqual(["a"]);
    }
    expect(tool).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});
