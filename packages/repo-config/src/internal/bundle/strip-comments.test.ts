import { describe, expect, it } from "vitest";
import { stripComments } from "@/internal/bundle/strip-comments";

describe("stripComments", () => {
  it("blanks a line comment and keeps the line count", () => {
    const code = "const a = 1; // process\nconst b = 2;\n";
    const stripped = stripComments(code);
    expect(stripped).toBe(`const a = 1;${" ".repeat(11)}\nconst b = 2;\n`);
    expect(stripped).toHaveLength(code.length);
  });

  it("blanks a block comment across lines, newlines kept", () => {
    expect(stripComments("a\n/* process\n   env */\nb")).toBe(
      `a\n${" ".repeat(10)}\n${" ".repeat(9)}\nb`,
    );
  });

  it("leaves a comment marker that is inside a string", () => {
    expect(stripComments(`const url = "https://x/y"; // gone`)).toBe(
      `const url = "https://x/y";${" ".repeat(8)}`,
    );
    expect(stripComments("const t = `a // b`;")).toBe("const t = `a // b`;");
    expect(stripComments(String.raw`const s = 'a\'// b';`)).toBe(String.raw`const s = 'a\'// b';`);
  });

  it("runs an unterminated comment to the end of the file", () => {
    expect(stripComments("a /* b")).toBe(`a ${" ".repeat(4)}`);
    expect(stripComments("a // b")).toBe(`a ${" ".repeat(4)}`);
  });
});
