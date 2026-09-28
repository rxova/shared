import { describe, expect, it } from "vitest";
import { isObjectLike } from "@/predicates/is-object-like";
import { PREDICATE_CASES } from "@/predicates/predicate-cases.fixtures";

describe("isObjectLike", () => {
  it.each(PREDICATE_CASES)("is %s for %s", (_label, value, expected) => {
    expect(isObjectLike(value)).toBe(expected);
  });
});
