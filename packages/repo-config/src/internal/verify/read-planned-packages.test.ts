import { describe, expect, it } from "vitest";
import { readPlannedPackages } from "@/internal/verify/read-planned-packages";

const task = (pkg: string, name: string, status: string, inputs = 1, command = "vitest run") => ({
  taskId: `${pkg}#${name}`,
  task: name,
  package: pkg,
  command,
  cache: { status },
  inputs: Object.fromEntries(Array.from({ length: inputs }, (_, i) => [`f${String(i)}.ts`, "h"])),
});
const dry = (...tasks: unknown[]) => JSON.stringify({ tasks });

describe("readPlannedPackages", () => {
  it("keeps the packages running the tasks, weighed by their inputs", () => {
    const json = dry(
      task("core", "build", "MISS", 9),
      task("core", "test", "MISS", 3),
      task("ui", "test", "HIT", 2),
      task("docs", "test", "MISS", 5, "<NONEXISTENT>"),
    );
    expect(readPlannedPackages(json, ["test"])).toEqual([
      { name: "core", weight: 3, hit: false },
      { name: "ui", weight: 2, hit: true },
    ]);
  });

  it("adds up a package's tasks, a hit only when all of them hit", () => {
    const json = dry(
      task("core", "lint", "HIT", 2),
      task("core", "typecheck", "MISS", 3),
      task("ui", "lint", "HIT", 1),
      task("ui", "typecheck", "HIT", 1),
    );
    expect(readPlannedPackages(json, ["lint", "typecheck"])).toEqual([
      { name: "core", weight: 5, hit: false },
      { name: "ui", weight: 2, hit: true },
    ]);
  });

  it("reads a task without inputs or cache as weightless and a miss, and skips junk", () => {
    const json = dry({ task: "test", package: "core" }, "junk", { task: "test", package: 1 });
    expect(readPlannedPackages(json, ["test"])).toEqual([{ name: "core", weight: 0, hit: false }]);
  });

  it("refuses output that is not turbo's plan", () => {
    expect(() => readPlannedPackages("• Packages in scope", ["test"])).toThrow("is not JSON");
    expect(() => readPlannedPackages("[]", ["test"])).toThrow("has no task list");
  });
});
