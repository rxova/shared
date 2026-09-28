import { describe, expect, it } from "vitest";
import { leadingAssignments } from "@/internal/shell/leading-assignments";

describe("leadingAssignments", () => {
  it("counts NAME=value words before the program", () => {
    expect(leadingAssignments(["A=1", "B_2=", "git", "C=3"])).toBe(2);
    expect(leadingAssignments(["1A=1"])).toBe(0);
    expect(leadingAssignments(["A=1"])).toBe(1);
  });
});
