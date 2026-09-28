import { describe, expect, it } from "vitest";
import { documentedExports } from "@/internal/llms/documented-exports";
import { apiTable } from "@/internal/llms/llms-repo.fixtures";

describe("documentedExports", () => {
  it("reads the first column of the tables under ## API", () => {
    expect(documentedExports(apiTable("toError", "ErrorClass"))).toEqual(["toError", "ErrorClass"]);
  });

  it("stops at the next ## heading, but not at a ### one", () => {
    const body = [apiTable("a"), "### Types", "| `b` | x |", "## Gotchas", "| `c` | x |"].join(
      "\n",
    );
    expect(documentedExports(body)).toEqual(["a", "b"]);
  });

  it("reads nothing when there is no API section", () => {
    expect(documentedExports("## Rules\n\n| `a` | b |")).toEqual([]);
  });

  it("skips header, separator and prose rows", () => {
    expect(documentedExports("## API\n| Export | Kind |\n| --- | --- |\n| plain | x |")).toEqual(
      [],
    );
  });
});
