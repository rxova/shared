import { describe, expect, it } from "vitest";
import { llmsStructureFailures } from "@/internal/llms/llms-structure-failures";
import { apiTable, PKG, wellFormed } from "@/internal/llms/llms-repo.fixtures";

describe("llmsStructureFailures", () => {
  it("passes a well-formed file", () => {
    expect(llmsStructureFailures(PKG, wellFormed("lib"))).toEqual([]);
  });

  it("accepts ## Use for ## Install, and needs no API section unless the api is exact", () => {
    const body = wellFormed("lib", "").replace("## Install", "## Use");
    expect(llmsStructureFailures(PKG, body, { api: "none" })).toEqual([]);
    expect(llmsStructureFailures(PKG, body)).toEqual(['llms.txt has no "## API" section']);
  });

  it("names every alternative of a missing section", () => {
    expect(llmsStructureFailures(PKG, wellFormed("lib").replace("## Install", "## Setup"))).toEqual(
      ['llms.txt has no "## Install" (or "## Use") section'],
    );
  });

  it("reads the required sections from the config", () => {
    const body = `${wellFormed("lib", apiTable("a"))}\n## Examples\n`;
    expect(llmsStructureFailures(PKG, body, { sections: ["Examples", "Recipes"] })).toEqual([
      'llms.txt has no "## Recipes" section',
    ]);
  });

  it("reports the files entry, the title and the summary", () => {
    expect(
      llmsStructureFailures({ ...PKG, files: ["dist"] }, "", { api: "none", sections: [] }),
    ).toEqual([
      "does not list llms.txt in `files`, so the tarball leaves it out",
      'llms.txt must open with "# lib", found ""',
      'llms.txt needs a "> " summary under the title',
    ]);
  });
});
