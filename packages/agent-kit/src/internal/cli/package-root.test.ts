import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { packageRoot } from "@/internal/cli/package-root";

describe("packageRoot", () => {
  it("finds the directory with package.json above a module", () => {
    expect(packageRoot(import.meta.url)).toMatch(/packages[\\/]agent-kit$/);
  });

  it("throws when there is none up to the root", () => {
    expect(() => packageRoot(pathToFileURL("/no-such-dir/x.js").href)).toThrow("no package.json");
  });
});
