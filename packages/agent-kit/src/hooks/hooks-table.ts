import type { HookSpec } from "@/hooks/hook.types";
import { configLock } from "@/hooks/config-lock";
import { contextNudge } from "@/hooks/context-nudge";
import { dangerZone } from "@/hooks/danger-zone";
import { devServer } from "@/hooks/dev-server";
import { handoffReminder } from "@/hooks/handoff-reminder";
import { memorySnapshot } from "@/hooks/memory-snapshot";
import { noAttribution } from "@/hooks/no-attribution";
import { noBypass } from "@/hooks/no-bypass";
import { quickCheck } from "@/hooks/quick-check";
import { secretGuard } from "@/hooks/secret-guard";
import { asHook } from "@/internal/hooks/as-hook";
import { BASH_TRIGGERS, EDIT_TRIGGERS } from "@/internal/hooks/guard-triggers";

/** Every hook the kit ships, by the name the hook command passes to the runner. */
export const hooks = {
  "no-bypass": {
    on: BASH_TRIGGERS,
    timeout: 5,
    summary: "block git calls that skip the repository’s hooks (--no-verify, HUSKY=0, …)",
    run: asHook("no-bypass", noBypass),
  },
  "no-attribution": {
    on: BASH_TRIGGERS,
    timeout: 5,
    summary: "block commit messages and PR bodies that credit an AI assistant",
    run: asHook("no-attribution", noAttribution),
  },
  "danger-zone": {
    on: BASH_TRIGGERS,
    timeout: 5,
    summary:
      "block rm -r outside the project, force pushes to main, discarding work, dropping data, cloud teardown",
    run: asHook("danger-zone", dangerZone),
  },
  "dev-server": {
    on: BASH_TRIGGERS,
    timeout: 5,
    summary: "block dev servers and watchers started in the foreground",
    run: asHook("dev-server", devServer),
  },
  "config-lock": {
    on: EDIT_TRIGGERS,
    timeout: 5,
    summary: "block edits to existing lint, format, type, commit and coverage configs",
    run: asHook("config-lock", configLock),
  },
  "secret-guard": {
    on: EDIT_TRIGGERS,
    timeout: 5,
    summary: "block writing API keys, tokens and private keys into source files",
    run: asHook("secret-guard", secretGuard),
  },
  "quick-check": quickCheck,
  "memory-snapshot": memorySnapshot,
  "handoff-reminder": handoffReminder,
  "context-nudge": contextNudge,
} as const satisfies Record<string, HookSpec>;

export type HookName = keyof typeof hooks;
