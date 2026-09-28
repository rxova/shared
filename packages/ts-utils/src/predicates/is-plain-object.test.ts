import { describe, expect, it } from "vitest";
import { isPlainObject } from "@/predicates/is-plain-object";
import { PREDICATE_CASES } from "@/predicates/predicate-cases.fixtures";

describe("isPlainObject", () => {
  it.each(PREDICATE_CASES)("answers for %s", (_label, value, _objectLike, _record, expected) => {
    expect(isPlainObject(value)).toBe(expected);
  });
});
