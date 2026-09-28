import { profiles } from '@/install/profiles';

/**
 * The items to install: a profile's set, plus `add`, minus `skip`. With no profile, the previous
 * install's selection is kept (so a plain `install` updates in place), or `core` on a first
 * install. Throws on an unknown profile or item name, listing what exists.
 */
export const selectItems = ({
  names,
  profile,
  add = [],
  skip = [],
  previous,
}: {
  names: readonly string[];
  profile: string | undefined;
  add?: readonly string[];
  skip?: readonly string[];
  previous: { profile: string; items: readonly string[] } | undefined;
}): { profile: string; items: string[] } => {
  const unknown = [...add, ...skip].filter((name) => !names.includes(name));
  if (unknown.length > 0)
    throw new Error(`unknown item ${unknown.join(', ')}; run \`rxova-ai list\` to see every item`);

  let base: { profile: string; items: readonly string[] };
  if (profile === undefined && previous !== undefined) {
    base = {
      profile: previous.profile,
      items: previous.items.filter((name) => names.includes(name)),
    };
  } else {
    const key = profile ?? 'core';
    const pick = Object.hasOwn(profiles, key) ? profiles[key] : undefined;
    if (pick === undefined)
      throw new Error(
        `unknown profile "${key}"; choose one of ${Object.keys(profiles).join(', ')}`,
      );
    base = { profile: key, items: pick(names) };
  }
  const chosen = new Set([...base.items, ...add].filter((name) => !skip.includes(name)));
  return { profile: base.profile, items: names.filter((name) => chosen.has(name)) };
};
