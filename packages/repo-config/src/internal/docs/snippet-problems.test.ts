import { describe, expect, it } from "vitest";
import { snippetProblems } from "@/internal/docs/snippet-problems";

const snippet = (code: string, language = "tsx") => ({ language, info: "", code, line: 1 });

describe("snippetProblems", () => {
  it("passes a snippet that parses", () => {
    expect(
      snippetProblems(snippet("import { useState } from 'react';\nconst [a] = useState(0);\n")),
    ).toEqual([]);
    expect(snippetProblems(snippet("const [a] = React.useState<number>(0);\n"))).toEqual([]);
    expect(snippetProblems(snippet("export const x: number = 1;\n", "ts"))).toEqual([]);
  });

  it("reports a snippet that does not parse", () => {
    expect(snippetProblems(snippet("const = ;", "ts"))).toEqual([
      expect.stringMatching(/^does not parse: /),
    ]);
  });

  it("reports a stray semicolon and a missing useState import", () => {
    expect(snippetProblems(snippet("const a = 1\n;<A />\n"))).toContain(
      "starts JSX with a stray leading semicolon",
    );
    expect(snippetProblems(snippet("const [a] = useState<number>(0);\n"))).toEqual([
      "uses useState without importing it",
    ]);
  });
});
