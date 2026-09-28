# @rxova/ai

A small kit for Claude Code:

- **three guard hooks** that enforce commit and config rules instead of asking for them;
- **four skills** for verifying work, handing it off, slicing features and auditing themes;
- **three agents** with the fewest tools and the cheapest model each job needs.

One command installs it, and one removes exactly what it installed.

```sh
npx @rxova/ai install            # into ~/.claude, for every project
npx @rxova/ai install --project  # into ./.claude, for this repository only
```

## Commands

| Command                                              | What it does                                                                                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `rxova-ai install [--project] [--dry-run] [--force]` | Copies the agents, skills and hook runner, and registers the guards in `settings.json`. Running it again updates in place.         |
| `rxova-ai uninstall [--project] [--dry-run]`         | Removes the files the last install wrote and the guard entries in `settings.json`. Every other file and setting is left as it was. |
| `rxova-ai status [--project]`                        | Shows the installed version and any file that is missing or differs from this version. Exits 1 when anything is out of step.       |

The install records what it wrote in `.claude/rx-ai/manifest.json`. It refuses to overwrite a
file it did not write (pass `--force` to allow it), and `--dry-run` prints the plan without
writing anything.

## Guards

The guards run as `PreToolUse` hooks through one bundled file, `.claude/rx-ai/hooks.js`, with
no dependencies and no `npx` on each call. A guard that blocks exits 2 and tells the agent why
and what to do instead. On anything unexpected (unreadable input, a crash) it lets the call
through: a guard never blocks a session because of its own failure.

| Guard            | Watches                | Blocks                                                                                                                                                                                                                                      |
| ---------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-bypass`      | Bash                   | git calls that skip the repository's hooks: `--no-verify`, `git commit -n`, `HUSKY=0`, and setting or clearing `core.hooksPath`.                                                                                                            |
| `no-attribution` | Bash                   | `git commit` messages and `gh pr create` / `gh pr edit` bodies that credit an AI assistant: a `Co-Authored-By` naming Claude, a session trailer, a "Generated with Claude" footer, or the robot emoji. Message and body files are read too. |
| `config-lock`    | Edit, Write, MultiEdit | Changes to an existing lint, format, type, commit or coverage config (ESLint, Prettier, Biome, Stylelint, tsconfig, commitlint, lint-staged, Vitest and Jest configs, …). Creating one is allowed.                                          |

Shell commands are split with quotes respected, so `git commit -m "why --no-verify is banned"`
is allowed, and each part of `a && b | c` is checked on its own.

To switch guards off for one session, set `RX_AI_OFF` to a comma-separated list:

```sh
RX_AI_OFF=config-lock claude
```

## Skills

| Skill            | Use it to                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `rx-verify`      | Run the repository's own gate before calling work done, and report what it said.                         |
| `rx-handoff`     | Write a note a fresh session can continue from (what worked, what did not, what is next), or resume one. |
| `rx-slice`       | Break a feature into thin end-to-end slices, confirm the plan, then build and ship one slice at a time.  |
| `rx-theme-audit` | Measure a site's dark and light themes in a browser and trace each problem to its token or file.         |

## Agents

| Agent         | Tools                  | Model  | Use it to                                              |
| ------------- | ---------------------- | ------ | ------------------------------------------------------ |
| `rx-planner`  | Read, Grep, Glob       | opus   | Turn a request into a sliced plan grounded in the code |
| `rx-reviewer` | Read, Grep, Glob, Bash | sonnet | Review a diff and report only defects it can back      |
| `rx-scout`    | Read, Grep, Glob       | haiku  | Find where things live without flooding the context    |

## Programmatic use

The package also exports the pieces the bin is built from: `runGuard`, `guards`,
`planInstall`, `installCopies`, `hookGroups`, `withOwnHooks` and `withoutOwnHooks`.

## License

MIT
