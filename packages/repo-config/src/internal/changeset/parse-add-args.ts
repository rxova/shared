import { parseBump, type Bump } from "@/internal/changeset/parse-bump";

/**
 * `<package> <bump> <summary…>`, or the flags `-p/--package`, `-t/--type` and
 * `-s/--summary` (which takes every word after it). Throws the usage line when
 * any of the three is missing.
 */
export const parseAddArgs = (
  argv: readonly string[],
): { token: string; bump: Bump; summary: string } => {
  let token = "";
  let bump: Bump | undefined;
  const summary: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    // In range, so defined.
    const arg = String(argv[index]);
    if (arg === "--package" || arg === "-p") {
      index += 1;
      token = argv[index] ?? "";
    } else if (arg === "--type" || arg === "-t") {
      index += 1;
      bump = parseBump(argv[index]);
    } else if (arg === "--summary" || arg === "-s") {
      summary.push(...argv.slice(index + 1));
      break;
    } else if (token === "") token = arg;
    else if (bump === undefined) bump = parseBump(arg);
    else summary.push(arg);
  }
  const text = summary.join(" ").trim();
  if (token === "" || bump === undefined || text === "") {
    throw new Error(
      "usage: rxova-repo-config add-changeset <package> <patch|minor|major> <summary>",
    );
  }
  return { token, bump, summary: text };
};
