import { describe, expect, it, vi } from "vitest";
import { tarballContents } from "@/internal/pack-smoke/tarball-contents";

describe("tarballContents", () => {
  it("lists the files under package/, without directories or blank lines", () => {
    const sh = vi.fn(() => "package/\npackage/LICENSE\r\npackage/dist/\npackage/dist/index.js\n\n");
    expect(tarballContents("/scratch/x.tgz", sh, "/scratch")).toEqual(["LICENSE", "dist/index.js"]);
    expect(sh).toHaveBeenCalledWith("tar", ["-tzf", "/scratch/x.tgz"], "/scratch");
  });
});
