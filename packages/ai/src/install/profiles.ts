/**
 * The ready-made selections. `core` is the everyday set: the safety hooks and the agents and
 * skills used on every change. `hackathon` is everything useful in a sprint. `full` is all of it.
 * Each is a function of the catalog's names, so new content joins the wider profiles on its own.
 */
export const profiles: Record<string, (names: readonly string[]) => string[]> = {
  core: (names) =>
    names.filter((name) =>
      [
        'rx-planner',
        'rx-reviewer',
        'rx-scout',
        'rx-builder',
        'rx-debugger',
        'rx-build-fixer',
        'rx-verify',
        'rx-handoff',
        'rx-slice',
        'rx-debug',
        'rx-ship',
        'no-bypass',
        'no-attribution',
        'danger-zone',
        'secret-guard',
        'dev-server',
        'config-lock',
      ].includes(name),
    ),
  hackathon: (names) => names.filter((name) => !['rx-tdd', 'rx-theme-audit'].includes(name)),
  full: (names) => [...names],
};
