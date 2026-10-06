import { describe, expect, it } from "vitest";
import { isPrivateRepository } from "@/internal/init/is-private-repository";

describe("isPrivateRepository", () => {
  it("asks gh for the visibility and is true only for PRIVATE", () => {
    const calls: string[] = [];
    const answer = (visibility: string) => (command: string, args: readonly string[]) => {
      calls.push([command, ...args].join(" "));
      return visibility;
    };
    expect(isPrivateRepository(answer("PRIVATE"))).toBe(true);
    expect(isPrivateRepository(answer("PUBLIC"))).toBe(false);
    expect(isPrivateRepository(answer("INTERNAL"))).toBe(false);
    expect(calls[0]).toBe("gh repo view --json visibility -q .visibility");
  });
});
