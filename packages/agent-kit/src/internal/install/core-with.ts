import { CORE_ITEMS } from '@/internal/install/profile-items';

/** A profile of core, plus a list of general items, plus every item `claims` accepts. */
export const coreWith =
  (extras: readonly string[], claims: (name: string) => boolean) =>
  (names: readonly string[]): string[] =>
    names.filter((name) => CORE_ITEMS.includes(name) || extras.includes(name) || claims(name));
