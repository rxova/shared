import { programName } from "@/internal/shell/program-name";
import { unwrapRunner } from "@/internal/shell/unwrap-runner";
import { DROP_SQL, SQL_CLIENTS } from "@/internal/hooks/sql-danger";

/**
 * A short description of what the words would destroy, or undefined when they are safe: SQL that
 * drops or truncates, database resets, cloud teardown, and disk-level commands.
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
  if (program === "aws" && has("s3", "rb") && args.includes("--force"))
    return "deletes an S3 bucket and its contents";
  if (program === "aws" && has("s3", "rm") && args.includes("--recursive"))
    return "deletes S3 objects recursively";
  if (
    program === "aws" &&
    args.some((arg) => /^delete-(stack|db-instance|db-cluster|table|function|bucket)$/.test(arg))
  )
    return "deletes AWS resources";
  if ((program === "fly" || program === "flyctl") && args.includes("destroy"))
    return "destroys a Fly app";
  if (program === "railway" && args.includes("delete")) return "deletes a Railway resource";
  if (program === "vercel" && (args.includes("remove") || args.includes("rm")))
    return "removes a Vercel deployment";
  if (program === "wrangler" && args.includes("delete")) return "deletes a Cloudflare resource";
  if (
    program === "mkfs" ||
    program.startsWith("mkfs.") ||
    (program === "dd" && args.some((arg) => arg.startsWith("of=/dev/")))
  )
    return "writes over a disk";
  return undefined;
};
