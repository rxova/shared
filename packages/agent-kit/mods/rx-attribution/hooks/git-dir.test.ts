import { expect, test } from "claude-code/testing";

import { gitDir } from "./git-dir";

const cases: readonly (readonly [command: string, dir: string | null | undefined])[] = [
  // No commit: nothing to read.
  ["git status", undefined],
  ["cd /repo && git push", undefined],
  // No cd and no -C: the session's own directory.
  ['git commit -m "feat: x"', undefined],
  ["git add -A && git commit -qm x", undefined],
  // A cd before the commit, however it is joined.
  ["cd /repo && git commit -m x", "/repo"],
  ["cd /repo; git add -A; git commit -m x", "/repo"],
  ["cd /repo\ngit commit -m x", "/repo"],
  ["cd /repo || exit 1; git commit -m x", "/repo"],
  ["(cd /repo && git commit -m x)", "/repo"],
  ["pnpm install && cd /repo && git commit -m x", "/repo"],
  // Quoted directories, with spaces.
  ['cd "/my repo" && git commit -m x', "/my repo"],
  ["cd '/my repo'; git commit -m x", "/my repo"],
  // Several cds: an absolute one starts over, a relative one goes onto the one before.
  ["cd /a && cd /b && git commit -m x", "/b"],
  ["cd /repo && cd packages/a && git commit -m x", "/repo/packages/a"],
  ["cd /repo/ && cd a && git commit -m x", "/repo/a"],
  ["cd ../sibling && git commit -m x", "../sibling"],
  // A cd after the commit does not count.
  ["cd /repo && git commit -m x && cd /elsewhere", "/repo"],
  // The commit's own -C, alone or after a cd.
  ["git -C /other commit -m x", "/other"],
  ['git -C "/my repo" commit -m x', "/my repo"],
  ["cd /repo && git -C sub commit -m x", "/repo/sub"],
  ["git -C /a -C b commit -m x", "/a/b"],
  ["git -c user.name=x commit -m x", undefined],
  // A -C on another git command does not count.
  ["git -C /other status && git commit -m x", undefined],
  // Only the shell knows: skip rather than read some other HEAD.
  ['cd "$W" && git commit -m x', null],
  ["cd $W; git commit -m x", null],
  ["cd `pwd`/x && git commit -m x", null],
  ["cd ~/repo && git commit -m x", null],
  ["cd - && git commit -m x", null],
  ["cd /repo && git -C $SUB commit -m x", null],
];

for (const [command, dir] of cases) {
  test(`${JSON.stringify(command)} → ${String(dir)}`, () => {
    expect(gitDir(command)).toBe(dir);
  });
}

test("a long run of repeated options stays fast", () => {
  const command = `git ${'-C "!" '.repeat(5000)}status && git commit -m x`;
  const started = Date.now();

  expect(gitDir(command)).toBeUndefined();
  expect(Date.now() - started).toBeLessThan(100);
});
