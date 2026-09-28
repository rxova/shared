import { describe, expect, it } from "vitest";
import { programName } from "@/internal/shell/program-name";

describe("programName", () => {
  it("drops the directory", () => {
    expect(programName("/opt/bin/gh")).toBe("gh");
    expect(programName("git")).toBe("git");
  });
});
