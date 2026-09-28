import { describe, expect, it } from "vitest";
import { directivesOf } from "@/internal/pack-smoke/directives-of";

describe("directivesOf", () => {
  it("reads the prologue in order, either quote, with or without semicolons", () => {
    expect(directivesOf('"use strict";"use client";var a=1;')).toEqual([
      "use strict",
      "use client",
    ]);
    expect(directivesOf("'use client'\nexport const a = 1;")).toEqual(["use client"]);
  });

  it("skips a hashbang, comments and whitespace before and between directives", () => {
    expect(
      directivesOf(
        "#!/usr/bin/env node\n// banner\n/* license */\n  \"use strict\";\n// x\n'use client';",
      ),
    ).toEqual(["use strict", "use client"]);
  });

  it("stops at the first statement that is not a directive", () => {
    expect(directivesOf('import a from "a";\n"use client";')).toEqual([]);
    expect(directivesOf("")).toEqual([]);
  });
});
