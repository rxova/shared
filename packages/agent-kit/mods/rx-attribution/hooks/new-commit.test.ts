import { expect, test } from "claude-code/testing";

import { newCommit } from "./new-commit";

const cases: readonly (readonly [output: string, hash: string | undefined])[] = [
  ["[main abc1234] feat: x\n 1 file changed", "abc1234"],
  ["[feat/x-y 0123abcd] fix: y", "0123abcd"],
  ["[main (root-commit) abc1234] chore: init", "abc1234"],
  ["[detached HEAD abc1234] wip", "abc1234"],
  ["lint-staged…\n✔ prettier\n[main abc1234] feat: x", "abc1234"],
  ["[main abc1234] one\n[main def5678] two", "def5678"],
  // Nothing printed (`git commit -q`), or something that only looks like it.
  ["", undefined],
  ["nothing to commit, working tree clean", undefined],
  ["see [the docs] abc1234", undefined],
  ["[main] no hash here", undefined],
  ["[main ABC1234] upper case is not git's", undefined],
];

for (const [output, hash] of cases) {
  test(`${JSON.stringify(output)} → ${String(hash)}`, () => {
    expect(newCommit(output)).toBe(hash);
  });
}

test("a long line without a closing bracket stays fast", () => {
  const started = Date.now();

  expect(newCommit(`[${" a".repeat(50_000)}`)).toBeUndefined();
  expect(Date.now() - started).toBeLessThan(100);
});
