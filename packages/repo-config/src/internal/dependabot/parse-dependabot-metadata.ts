import type { DependabotMetadata, SemverUpdate } from "@/internal/dependabot/dependabot.types";

const NAME = /^\s*(?:-\s+)?dependency-name:\s*(.+?)\s*$/;
const UPDATE_TYPE =
  /^\s*(?:-\s+)?update-type:\s*["']?version-update:semver-(major|minor|patch)["']?\s*$/;

/**
 * Reads the YAML block Dependabot appends to its commit message: the lines
 * after a `---` line followed by `updated-dependencies:`, up to a `...` line
 * or the end. Collects each `dependency-name` (quotes stripped, each once) and
 * each semver `update-type`. Line by line, not a YAML parser: the block is
 * Dependabot's own fixed shape. A message without the block reads as empty.
 */
export const parseDependabotMetadata = (message: string): DependabotMetadata => {
  const lines = message.split(/\r?\n/);
  const start = lines.findIndex(
    (line, index) => line.trim() === "---" && lines[index + 1]?.trim() === "updated-dependencies:",
  );
  const names: string[] = [];
  const updateTypes: SemverUpdate[] = [];
  if (start === -1) return { names, updateTypes };

  for (const line of lines.slice(start + 2)) {
    if (line.trim() === "...") break;
    const name = NAME.exec(line)?.[1]?.replace(/^(["'])(.*)\1$/, "$2");
    if (name !== undefined && name !== "" && !names.includes(name)) names.push(name);
    const updateType = UPDATE_TYPE.exec(line)?.[1] as SemverUpdate | undefined;
    if (updateType !== undefined) updateTypes.push(updateType);
  }
  return { names, updateTypes };
};
