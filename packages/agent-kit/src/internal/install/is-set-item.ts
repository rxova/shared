/** Whether an item belongs to a prefixed set: `fe` (React), `qa` or `mkt` (marketing). */
export const isSetItem = (name: string, set: 'fe' | 'qa' | 'mkt'): boolean =>
  name.startsWith(`rx-${set}-`);
