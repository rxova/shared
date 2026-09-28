import { describe, expect, it } from "vitest";
import { renameFiles } from "@/internal/init/rename-files";

describe("renameFiles", () => {
  it("rewrites only the text files that change", () => {
    const files: Record<string, string> = {
      "/r/README.md": "# template-oss",
      "/r/same.txt": "untouched",
      "/r/logo.png": "template-oss\0binary",
    };
    const written: Record<string, string> = {};
    const changed = renameFiles(
      "/r",
      ["README.md", "same.txt", "logo.png", "gone.md"],
      [["template-oss", "idea"]],
      {
        read: (file) => files[file],
        write: (file, contents) => {
          written[file] = contents;
        },
      },
    );
    expect(changed).toEqual(["README.md"]);
    expect(written).toEqual({ "/r/README.md": "# idea" });
  });
});
