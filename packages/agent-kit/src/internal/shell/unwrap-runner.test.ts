import { describe, expect, it } from "vitest";
import { unwrapRunner } from "@/internal/shell/unwrap-runner";

describe("unwrapRunner", () => {
  it.each([
    [
      ["npx", "prisma", "migrate"],
      ["prisma", "migrate"],
    ],
    [["npx", "--yes", "prisma"], ["prisma"]],
    [
      ["A=1", "sudo", "rm", "-rf", "x"],
      ["rm", "-rf", "x"],
    ],
    [
      ["pnpm", "dlx", "wrangler", "delete"],
      ["wrangler", "delete"],
    ],
    [["yarn", "exec", "bunx", "terraform"], ["terraform"]],
    [["pnpx", "x"], ["x"]],
    [
      ["pnpm", "run", "dev"],
      ["pnpm", "run", "dev"],
    ],
    [[], []],
  ])("%j → %j", (words, expected) => {
    expect(unwrapRunner(words)).toEqual(expected);
  });
});
