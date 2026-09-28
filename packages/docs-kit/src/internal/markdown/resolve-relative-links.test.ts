import { describe, expect, it } from "vitest";
import { resolveRelativeLinks } from "@/internal/markdown/resolve-relative-links";

const options = { origin: "https://x.org", base: "/docs/", fromRoute: "/learn/severity.md" };

describe("resolveRelativeLinks", () => {
  it("resolves against the twin being written, keeping the fragment", () => {
    expect(resolveRelativeLinks("[r](../rules/Test-Removed.md#why)", options)).toBe(
      "[r](https://x.org/docs/rules/test-removed.md#why)",
    );
    expect(resolveRelativeLinks("[s](./other.md)", options)).toBe(
      "[s](https://x.org/docs/learn/other.md)",
    );
  });

  it("leaves other links alone", () => {
    const text = "[a](/abs/) [b](https://e.com/x.md) [c](./image.png) [d](x.md)";
    expect(resolveRelativeLinks(text, options)).toBe(text);
  });
});
