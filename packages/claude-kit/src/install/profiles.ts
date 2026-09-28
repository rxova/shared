import { CORE_ITEMS, DOTNET_EXTRAS, isDotnetItem } from '@/internal/install/profile-items';

/**
 * The ready-made selections. `core` is the everyday set: the safety hooks and the agents and
 * skills used on every change. `hackathon` is everything useful in a sprint, without the .NET
 * and Datadog set. `dotnet` is core plus the .NET, EF Core and Datadog set and the helpers that
 * suit service migrations. `full` is all of it. Each is a function of the catalog's names, so
 * new content joins the wider profiles on its own.
 */
export const profiles: Record<string, (names: readonly string[]) => string[]> = {
  core: (names) => names.filter((name) => CORE_ITEMS.includes(name)),
  hackathon: (names) =>
    names.filter((name) => !['rx-tdd', 'rx-theme-audit'].includes(name) && !isDotnetItem(name)),
  dotnet: (names) =>
    names.filter(
      (name) => CORE_ITEMS.includes(name) || DOTNET_EXTRAS.includes(name) || isDotnetItem(name),
    ),
  full: (names) => [...names],
};
