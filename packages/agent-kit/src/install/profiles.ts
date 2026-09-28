import {
  CORE_ITEMS,
  DOTNET_EXTRAS,
  MARKETING_EXTRAS,
  QA_EXTRAS,
  REACT_EXTRAS,
  isDotnetItem,
} from "@/internal/install/profile-items";
import { coreWith } from "@/internal/install/core-with";
import { isSetItem } from "@/internal/install/is-set-item";

/**
 * The ready-made selections. `core` is the everyday set: the safety hooks and the agents and
 * skills used on every change. `hackathon` is everything useful in a sprint, without the .NET,
 * Datadog, React (`rx-fe-*`), QA (`rx-qa-*`) and marketing (`rx-mkt-*`) sets. `dotnet`, `react`,
 * `qa` and `marketing` are core plus one set and the general items that suit it. `full` is all of
 * it. Each is a function of the catalog's names, so new content joins the wider profiles on its
 * own.
 */
export const profiles: Record<string, (names: readonly string[]) => string[]> = {
  core: (names) => names.filter((name) => CORE_ITEMS.includes(name)),
  hackathon: (names) =>
    names.filter(
      (name) =>
        !["rx-tdd", "rx-theme-audit"].includes(name) &&
        !isDotnetItem(name) &&
        !isSetItem(name, "fe") &&
        !isSetItem(name, "qa") &&
        !isSetItem(name, "mkt"),
    ),
  dotnet: coreWith(DOTNET_EXTRAS, isDotnetItem),
  react: coreWith(REACT_EXTRAS, (name) => isSetItem(name, "fe")),
  qa: coreWith(QA_EXTRAS, (name) => isSetItem(name, "qa")),
  marketing: coreWith(MARKETING_EXTRAS, (name) => isSetItem(name, "mkt")),
  full: (names) => [...names],
};
