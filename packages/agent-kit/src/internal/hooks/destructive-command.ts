import { programName } from "@/internal/shell/program-name";
import { unwrapRunner } from "@/internal/shell/unwrap-runner";
import { DROP_SQL, SQL_CLIENTS } from "@/internal/hooks/sql-danger";

/**
 * A short description of what the words would destroy, or undefined when they are safe: SQL that
 * drops or truncates, database resets, `terraform destroy`, and disk-level commands.
 * Hosting and cloud CLIs are left alone, so the guard stays the same whichever platform a
 * project deploys to.
 */
export const destructiveCommand = (words: readonly string[]): string | undefined => {
  const [first = "", ...args] = unwrapRunner(words);
  const program = programName(first);
  const has = (...wanted: string[]) => wanted.every((word) => args.includes(word));

  if (SQL_CLIENTS.has(program) && args.some((arg) => DROP_SQL.test(arg)))
    return "drops or truncates data";
  if (
    program === "supabase" &&
    has("db", "reset") &&
    args.some((arg) => arg === "--linked" || arg.startsWith("--db-url"))
  )
    return "resets a remote Supabase database";
  if (program === "prisma" && has("migrate", "reset")) return "resets the database";
  if (program === "dotnet" && has("ef", "database", "drop")) return "drops the database";
  if (program === "dotnet" && has("ef", "database", "update") && args.at(-1) === "0")
    return "reverts every migration";
  if (program === "terraform" && has("destroy")) return "destroys infrastructure";
  if (
    program === "mkfs" ||
    program.startsWith("mkfs.") ||
    (program === "dd" && args.some((arg) => arg.startsWith("of=/dev/")))
  )
    return "writes over a disk";
  return undefined;
};
