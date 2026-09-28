export { runHook } from "@/hooks/run-hook";
export { runHooks } from "@/hooks/run-hooks";
export { hooks } from "@/hooks/hooks-table";
export type { HookName } from "@/hooks/hooks-table";
export type {
  Guard,
  HookContext,
  HookEvent,
  HookInput,
  HookOutcome,
  HookSpec,
  HookTrigger,
  RunResult,
  Verdict,
} from "@/hooks/hook.types";
export { catalog } from "@/install/catalog";
export { profiles } from "@/install/profiles";
export { selectItems } from "@/install/select-items";
export { resolveTargets } from "@/install/resolve-targets";
export { opencodeAgent } from "@/install/opencode-agent";
export { opencodeHooks } from "@/install/opencode-hooks";
export type { OpencodeHooks } from "@/install/opencode-hooks";
export { opencodePlugin } from "@/install/opencode-plugin";
export { planInstall } from "@/install/plan-install";
export { installCopies } from "@/install/install-copies";
export { hookGroups } from "@/install/hook-groups";
export { withOwnHooks } from "@/install/with-own-hooks";
export { withoutOwnHooks } from "@/install/without-own-hooks";
export type {
  CatalogItem,
  Copy,
  HookGroup,
  HookGroups,
  InstallPlan,
  InstallTarget,
  Manifest,
  TargetKind,
} from "@/install/install.types";
