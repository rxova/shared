import type { ComponentRules } from "@/markdown/markdown.types";

/**
 * The default component rules merged with a repository's additions.
 *
 * Unwrapped by default: Starlight's layout components, which carry no
 * information a reader of the twin loses. Headings by default: `TabItem` (its
 * label names the package manager) and `Card` (its title names the card). A
 * heading component is unwrapped too, so its closing tag goes.
 */
export const componentRules = ({ unwrap = [], headings = {} }: ComponentRules = {}): {
  unwrap: string[];
  headings: Record<string, number>;
} => {
  const allHeadings = { TabItem: 4, Card: 3, ...headings };
  return {
    unwrap: [
      ...new Set([
        ...["Tabs", "TabItem", "CardGrid", "Card", "Steps", "Aside", "LinkCard"],
        ...unwrap,
        ...Object.keys(allHeadings),
      ]),
    ],
    headings: allHeadings,
  };
};
