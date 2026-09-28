import { describe, expect, it } from "vitest";
import { dangerZone } from "@/hooks/danger-zone";
import { bash, contextWith } from "@/internal/hooks/context.fixtures";

const clean = contextWith({
  env: { HOME: "/home/me" },
  programs: {
    "git rev-parse --abbrev-ref HEAD": { stdout: "feat/x\n" },
    "git status --porcelain": { stdout: "" },
  },
});
const dirty = contextWith({
  env: { HOME: "/home/me" },
  programs: {
    "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
    "git status --porcelain": { stdout: " M a.ts\n" },
  },
});
const blocked = (command: string, context = clean) =>
  dangerZone(bash(command, "/home/me/app"), context).block;

describe("dangerZone", () => {
  it.each([
    "rm -rf /",
    "rm -rf ~",
    "rm -rf ~/Documents",
    "rm -fr ..",
    "rm -r ../other-project",
    "rm --recursive /tmp/x",
    "sudo rm -rf /var/lib",
    "rm -rf .",
    'rm -rf "$BUILD_DIR"',
    "cd x && rm -rf /home/me/app",
  ])("blocks the recursive removal %s", (command) => {
    expect(blocked(command)).toBe(true);
  });

  it.each([
    "rm -rf dist node_modules",
    "rm -rf ./build/",
    "rm -rf /home/me/app/.next",
    "rm file.txt",
    "rm -f ../x.log",
  ])("allows %s", (command) => {
    expect(blocked(command)).toBe(false);
  });

  it.each([
    "git push --force origin main",
    "git push -f origin HEAD:master",
    "git push origin +main",
    "git push --force-with-lease origin refs/heads/production",
  ])("blocks the force push %s", (command) => {
    expect(blocked(command)).toBe(true);
  });

  it("checks the current branch when a force push names none", () => {
    expect(blocked("git push --force", dirty)).toBe(true);
    expect(blocked("git push --force", clean)).toBe(false);
    expect(blocked("git push --force", contextWith())).toBe(false);
  });

  it.each([
    "git push origin main",
    "git push --force-with-lease origin feat/x",
    "git push -u origin feat/y",
  ])("allows %s", (command) => {
    expect(blocked(command, dirty)).toBe(false);
  });

  it.each([
    "git reset --hard",
    "git clean -fdx",
    "git checkout -- .",
    "git checkout .",
    "git restore src",
    "git stash drop",
  ])("blocks %s when there are uncommitted changes, and allows it on a clean tree", (command) => {
    expect(blocked(command, dirty)).toBe(true);
    expect(blocked(command, clean)).toBe(false);
  });

  it.each([
    "git reset --soft HEAD~1",
    "git restore --staged a.ts",
    "git checkout feat/x",
    "git stash list",
    "git clean -n",
  ])("allows %s on a dirty tree", (command) => {
    expect(blocked(command, dirty)).toBe(false);
  });

  it.each([
    'psql "$DATABASE_URL" -c "DROP TABLE users"',
    'psql -c "truncate orders"',
    'sqlite3 app.db "drop table if exists users"',
    "supabase db reset --linked",
    "supabase db reset --db-url postgres://x",
    "npx prisma migrate reset",
    "dotnet ef database drop --force",
    "dotnet ef database update 0",
    "terraform destroy",
    "aws s3 rb s3://bucket --force",
    "aws s3 rm s3://bucket/ --recursive",
    "aws cloudformation delete-stack --stack-name app",
    "fly apps destroy my-app",
    "railway delete",
    "vercel remove my-app",
    "wrangler d1 delete db",
    "mkfs.ext4 /dev/sdb1",
    "dd if=/dev/zero of=/dev/disk2",
  ])("blocks the destructive %s", (command) => {
    expect(blocked(command)).toBe(true);
  });

  it.each([
    'psql -c "select * from users"',
    "supabase db reset",
    "prisma migrate dev",
    "dotnet ef database update",
    "dotnet ef migrations add Init",
    "terraform plan",
    "aws s3 ls",
    "aws s3 rm s3://bucket/one-file",
    "fly deploy",
    "dd if=a.img of=b.img",
    "echo drop table",
  ])("allows %s", (command) => {
    expect(blocked(command)).toBe(false);
  });

  it("tells the agent to ask the user", () => {
    expect(dangerZone(bash("terraform destroy"), clean)).toEqual({
      block: true,
      reason: expect.stringContaining("ask the user") as string,
    });
  });

  it("falls back to PWD and a home it cannot match when the input has neither", () => {
    const context = contextWith({ env: { PWD: "/work" } });
    expect(
      dangerZone({ tool_name: "Bash", tool_input: { command: "rm -rf /etc" } }, context).block,
    ).toBe(true);
    expect(
      dangerZone({ tool_name: "Bash", tool_input: { command: "rm -rf build" } }, contextWith())
        .block,
    ).toBe(false);
  });

  it("ignores every tool but Bash", () => {
    expect(
      dangerZone({ tool_name: "Write", tool_input: { command: "rm -rf /" } }, clean).block,
    ).toBe(false);
  });
});
