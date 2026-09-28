import type { LlmsConfig } from "@/config/config.types";
import { LLMS_FILE } from "@/internal/llms/llms-file";
import type { PublishedPackage } from "@/internal/llms/llms.types";

/**
 * The shape problems of one package's `llms.txt`: left out of `files`, a
 * title that is not the package name (a file copied from a sibling), no `> `
 * summary under it (llmstxt.org), and a missing section. `sections` are the
 * `## ` headings required, `A|B` accepting either (`Install|Use`: a CLI is
 * used, not installed); `API` is added when `api` is `exact`.
 */
export const llmsStructureFailures = (
  pkg: PublishedPackage,
  body: string,
  { api = "exact", sections = ["Install|Use", "Docs"] }: LlmsConfig = {},
): string[] => {
  const failures: string[] = [];
  if (!pkg.files.includes(LLMS_FILE)) {
    failures.push(`does not list ${LLMS_FILE} in \`files\`, so the tarball leaves it out`);
  }
  const lines = body.split("\n");
  const [title = ""] = lines;
  if (title !== `# ${pkg.name}`) {
    failures.push(`${LLMS_FILE} must open with "# ${pkg.name}", found ${JSON.stringify(title)}`);
  }
  if (!lines.slice(1, 4).some((line) => line.startsWith("> "))) {
    failures.push(`${LLMS_FILE} needs a "> " summary under the title`);
  }
  const wanted = api === "exact" && !sections.includes("API") ? [...sections, "API"] : sections;
  for (const section of wanted) {
    const [first = "", ...others] = section.split("|").map((heading) => heading.trim());
    if ([first, ...others].some((heading) => lines.includes(`## ${heading}`))) continue;
    const or = others.map((heading) => ` (or "## ${heading}")`).join("");
    failures.push(`${LLMS_FILE} has no "## ${first}"${or} section`);
  }
  return failures;
};
