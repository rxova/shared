import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { hooks } from "@/hooks/hooks-table";
import type { CatalogItem } from "@/install/install.types";
import { readFrontmatter } from "@/internal/install/read-frontmatter";

/** Everything the kit can install: the agents and skills under `content/`, and the hooks. */
export const catalog = (packageDir: string): CatalogItem[] => {
  const content = join(packageDir, "content");
  const names = (dir: string) =>
    existsSync(join(content, dir)) ? readdirSync(join(content, dir)).sort() : [];
  const agents = names("agents")
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({
      name: file.slice(0, -3),
      kind: "agent" as const,
      summary: readFrontmatter(join(content, "agents", file)).description ?? "",
    }));
  const skills = names("skills")
    .filter((dir) => existsSync(join(content, "skills", dir, "SKILL.md")))
    .map((dir) => ({
      name: dir,
      kind: "skill" as const,
      summary: readFrontmatter(join(content, "skills", dir, "SKILL.md")).description ?? "",
    }));
  const hookItems = Object.entries(hooks).map(([name, spec]) => ({
    name,
    kind: "hook" as const,
    summary: spec.summary,
  }));
  return [...agents, ...skills, ...hookItems];
};
