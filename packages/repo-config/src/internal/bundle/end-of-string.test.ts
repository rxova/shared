import { describe, expect, it } from "vitest";
import { endOfString } from "@/internal/bundle/end-of-string";

describe("endOfString", () => {
  it("ends just past the closing quote", () => {
    expect(endOfString(`a "bc" d`, 2, '"')).toBe(6);
  });

  it("walks over an escaped quote", () => {
    expect(endOfString(String.raw`"a\"b" `, 0, '"')).toBe(6);
  });

  it("stops at the end of an unterminated run", () => {
    expect(endOfString(`"abc`, 0, '"')).toBe(4);
  });
});
