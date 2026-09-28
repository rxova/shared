import { describe, expect, it } from "vitest";
import { componentRules } from "@/internal/markdown/component-rules";

describe("componentRules", () => {
  it("has the Starlight layout components and two heading components by default", () => {
    expect(componentRules()).toEqual({
      unwrap: ["Tabs", "TabItem", "CardGrid", "Card", "Steps", "Aside", "LinkCard"],
      headings: { TabItem: 4, Card: 3 },
    });
  });

  it("adds components, and unwraps every heading component", () => {
    const rules = componentRules({ unwrap: ["Tabs", "Badge"], headings: { Details: 3, Card: 2 } });
    expect(rules.unwrap).toEqual([
      "Tabs",
      "TabItem",
      "CardGrid",
      "Card",
      "Steps",
      "Aside",
      "LinkCard",
      "Badge",
      "Details",
    ]);
    expect(rules.headings).toEqual({ TabItem: 4, Card: 2, Details: 3 });
  });
});
