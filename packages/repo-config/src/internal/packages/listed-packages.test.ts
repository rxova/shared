import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { listedPackages } from "@/internal/packages/listed-packages";

const root = mkdtempSync(join(tmpdir(), "listed-packages-"));
const write = (dir: string, manifest: object) => {
  mkdirSync(join(root, "packages", dir), { recursive: true });
  writeFileSync(join(root, "packages", dir, "package.json"), JSON.stringify(manifest));
};
write("react-otp-input", { name: "@rxova/react-otp-input", rxova: { slug: "otp", label: "OTP" } });
write("react-date-input", { name: "@rxova/react-date-input", rxova: { slug: "date" } });
write("react-rating-input", {
  name: "@rxova/react-rating-input",
  rxova: { slug: "rating", label: "rating" },
});
write("utils", { name: "utils", private: true, rxova: {} });
write("codemod", { name: "@rxova/codemod" });
write("nameless", { rxova: { slug: "Zed" } });
write("zed-twin", { name: "zed-twin", rxova: { slug: "zed" } });

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("listedPackages", () => {
  it("lists the marked packages, sorted by label, then slug", () => {
    expect(listedPackages(root, "rxova.slug")).toEqual([
      { dir: "react-date-input", name: "@rxova/react-date-input" },
      { dir: "react-otp-input", name: "@rxova/react-otp-input" },
      { dir: "react-rating-input", name: "@rxova/react-rating-input" },
      { dir: "nameless", name: "nameless" },
      { dir: "zed-twin", name: "zed-twin" },
    ]);
  });

  it("lists every published package without a marker, by label or name", () => {
    expect(listedPackages(root).map(({ dir }) => dir)).toEqual([
      "codemod",
      "react-date-input",
      "nameless",
      "react-otp-input",
      "react-rating-input",
      "zed-twin",
    ]);
  });

  it("accepts a non-string marker as long as it is set", () => {
    expect(listedPackages(root, "rxova").map(({ dir }) => dir)).toEqual([
      "react-date-input",
      "nameless",
      "react-otp-input",
      "react-rating-input",
      "utils",
      "zed-twin",
    ]);
  });
});
