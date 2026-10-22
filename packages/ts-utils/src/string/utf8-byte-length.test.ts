import { describe, expect, it } from "vitest";
import { utf8ByteLength } from "@/string/utf8-byte-length";

const encoded = (text: string): number => new TextEncoder().encode(text).byteLength;

describe("utf8ByteLength", () => {
  it.each([
    ["empty", "", 0],
    ["ASCII", "hello", 5],
    ["two-byte letters", "üé", 4],
    ["three-byte characters", "✓€", 6],
    ["an astral emoji", "🐙", 4],
    ["a mix", "a✓🐙ü", 10],
  ])("counts %s", (_label, text, expected) => {
    expect(utf8ByteLength(text)).toBe(expected);
    expect(utf8ByteLength(text)).toBe(encoded(text));
  });

  it.each([
    ["a lone high surrogate", "\ud83d"],
    ["a lone high surrogate before text", "\ud83dx"],
    ["a lone low surrogate", "\udc19"],
    ["two high surrogates", "\ud83d\ud83d"],
    ["a reversed pair", "\udc19\ud83d"],
  ])("counts %s as TextEncoder does", (_label, text) => {
    expect(utf8ByteLength(text)).toBe(encoded(text));
  });

  it("agrees with TextEncoder at every boundary", () => {
    const edges = [0x7f, 0x80, 0x7ff, 0x800, 0xd7ff, 0xe000, 0xffff, 0x10000, 0x10ffff];
    for (const codePoint of edges) {
      const text = String.fromCodePoint(codePoint);
      expect(utf8ByteLength(text)).toBe(encoded(text));
    }
  });
});
