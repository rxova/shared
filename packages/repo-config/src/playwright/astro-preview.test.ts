import { describe, expect, it } from "vitest";
import { astroPreview } from "@/playwright/astro-preview";

describe("astroPreview", () => {
  it("serves the build on the port, beside other previews", () => {
    expect(astroPreview(4321)).toBe("astro preview --port 4321 --ignore-lock");
  });
});
