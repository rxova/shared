# Shared GitHub Actions

Composite actions for rxova repositories. Reference them by path and ref:

```yaml
- uses: rxova/shared/actions/setup-pnpm@main
```

| Action               | Inputs                         | What it does                                                                                                     |
| -------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `setup-pnpm`         | `node-version`, `registry-url` | Installs pnpm at the `packageManager` version (the install itself is cached) and Node with the pnpm store cached |
| `turbo-cache`        | `key`                          | Restores and saves the local `.turbo` cache per job. Pass a distinct `key` per matrix leg                        |
| `turbo-remote-cache` | —                              | Points Turbo at a remote cache backed by the Actions cache, fetched and stored per task hash                     |
| `setup-playwright`   | `browsers`                     | Installs Playwright browsers outside the checkout, cached by Playwright version and browser set                  |

This repository's own workflows use them through `./actions/<name>`, so a change here is tested by
its own CI before anyone else picks it up.
