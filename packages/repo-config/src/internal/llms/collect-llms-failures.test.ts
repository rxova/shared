import { afterEach, describe, expect, it } from "vitest";
import { collectLlmsFailures } from "@/internal/llms/collect-llms-failures";
import { cleanupLlmsRepos, INDEX, llmsRepo, wellFormed } from "@/internal/llms/llms-repo.fixtures";

afterEach(cleanupLlmsRepos);

describe("collectLlmsFailures", () => {
  it("checks every published package and the root index", () => {
    const root = llmsRepo(
      { lib: { name: "lib", llms: wellFormed("lib"), index: INDEX }, other: { name: "other" } },
      "- [lib](packages/lib/llms.txt)\n",
    );

    expect(collectLlmsFailures(root)).toEqual([
      { where: "other", reason: "has no llms.txt; every published package ships one" },
      {
        where: "llms.txt",
        reason: "does not link packages/other/llms.txt, so other is missing from the index",
      },
    ]);
  });
});
