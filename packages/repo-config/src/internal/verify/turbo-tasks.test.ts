import { describe, expect, it } from "vitest";
import { turboTasks } from "@/internal/verify/turbo-tasks";

describe("turboTasks", () => {
  it("reads every task after `turbo run`, up to the first flag", () => {
    expect(turboTasks("pnpm exec turbo run test")).toEqual(["test"]);
    expect(turboTasks("turbo run lint typecheck --filter=web --concurrency=1")).toEqual([
      "lint",
      "typecheck",
    ]);
    expect(turboTasks("pnpm exec turbo run //#dedupe:check")).toEqual(["//#dedupe:check"]);
  });

  it("stops at a shell operator", () => {
    expect(turboTasks("turbo run build && echo done")).toEqual(["build"]);
    expect(turboTasks("turbo run build;echo done")).toEqual(["build"]);
  });

  it("is empty when no turbo task runs", () => {
    expect(turboTasks("pnpm test")).toEqual([]);
    expect(turboTasks("turbo run --dry")).toEqual([]);
    expect(turboTasks("pnpm exec turborun test")).toEqual([]);
  });
});
