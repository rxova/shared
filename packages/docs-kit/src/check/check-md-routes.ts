import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import type { CheckMdRoutesOptions, CheckMdRoutesResult } from "@/check/check.types";
import { twinFor } from "@/check/twin-for";
import { collectFiles } from "@/internal/check/collect-files";
import { forbiddenMarkup } from "@/internal/check/forbidden-markup";
import { isUntwinned } from "@/internal/check/is-untwinned";
import { sitePrefix } from "@/internal/check/site-prefix";
import { componentRules } from "@/internal/markdown/component-rules";
import { escapeRegExp } from "@/internal/markdown/escape-regexp";
import { splitFenced } from "@/markdown/split-fenced";

/**
 * Checks the agent-facing surfaces of a built site: every page has a `.md`
 * twin, no twin still holds markup the normalizer should have removed, every
 * link from one twin to another lands on a twin that exists, and llms.txt and
 * llms-full.txt stay inside their budgets.
 *
 * Its reason to exist is that none of this fails a build on its own: a twin
 * with a `<TabItem>` left in it, or a link to a twin that is not there, still
 * reads as a document, and the reader who would notice is a model with no way
 * to ask. Reads `dist`, never the content, because dist is what ships.
 */
export const checkMdRoutes = async (
  distDir: string,
  {
    untwinned = ["404.html"],
    maxFullBytes = 800 * 1024,
    maxIndexBytes = 24 * 1024,
    components,
    forbidden = [],
    forbiddenInfo = [],
  }: CheckMdRoutesOptions = {},
): Promise<CheckMdRoutesResult> => {
  const failures: string[] = [];
  const htmlFiles = await collectFiles(distDir, ".html");
  const mdFiles = new Set(await collectFiles(distDir, ".md"));

  for (const html of htmlFiles) {
    if (isUntwinned(html, untwinned)) continue;
    // A redirect stub (Astro writes one per `redirects` entry) has no content to twin.
    if (/<meta[^>]+http-equiv=["']?refresh/i.test(await readFile(join(distDir, html), "utf8"))) {
      continue;
    }
    const twin = twinFor(html);
    if (!mdFiles.has(twin)) failures.push(`${html} has no markdown twin at ${twin}`);
  }

  const prefix = await sitePrefix(distDir, [...mdFiles]);
  if (mdFiles.size > 0 && prefix === undefined) {
    failures.push('could not determine the site prefix from any twin\'s "source:" frontmatter');
  }
  const twinLink =
    prefix === undefined
      ? undefined
      : new RegExp(`\\]\\(${escapeRegExp(prefix)}([^)\\s#]*\\.md)`, "g");
  const markup = [...forbiddenMarkup(componentRules(components).unwrap), ...forbidden];

  for (const md of [...mdFiles].sort()) {
    const { unfenced, openers } = splitFenced(await readFile(join(distDir, md), "utf8"));
    const report = (found: string | undefined, why: string) => {
      if (found !== undefined)
        failures.push(`${md} contains ${why}: ${JSON.stringify(found.slice(0, 60))}`);
    };
    for (const [pattern, why] of markup) report(pattern.exec(unfenced)?.[0], why);
    for (const [pattern, why] of forbiddenInfo) {
      report(
        openers.map((line) => pattern.exec(line)?.[0]).find((hit) => hit !== undefined),
        why,
      );
    }
    for (const [, target = ""] of twinLink === undefined ? [] : unfenced.matchAll(twinLink)) {
      if (!mdFiles.has(target)) failures.push(`${md} links to ${target}, which is not a twin`);
    }
  }

  const budgets = [
    ["llms-full.txt", maxFullBytes, "split it or raise the budget deliberately"],
    ["llms.txt", maxIndexBytes, "it is an index — collapse a section rather than raising this"],
  ] as const;
  for (const [name, budget, advice] of budgets) {
    const found = await stat(join(distDir, name)).catch(() => undefined);
    if (found !== undefined && found.size > budget) {
      failures.push(
        `${name} is ${String(Math.round(found.size / 1024))} kB, over the ${String(budget / 1024)} kB budget — ${advice}`,
      );
    }
  }

  return { failures, pages: htmlFiles.length, twins: mdFiles.size };
};
