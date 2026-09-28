/** The everyday set every profile starts from. */
export const CORE_ITEMS: readonly string[] = [
  "rx-planner",
  "rx-reviewer",
  "rx-scout",
  "rx-builder",
  "rx-debugger",
  "rx-build-fixer",
  "rx-verify",
  "rx-handoff",
  "rx-slice",
  "rx-debug",
  "rx-ship",
  "no-bypass",
  "no-attribution",
  "danger-zone",
  "secret-guard",
  "dev-server",
  "config-lock",
];

/** General items that suit migrating backend services, added to core in the dotnet profile. */
export const DOTNET_EXTRAS: readonly string[] = [
  "rx-architect",
  "rx-test-writer",
  "rx-security",
  "rx-researcher",
  "rx-parallel",
  "rx-tdd",
  "rx-security-sweep",
  "rx-postgres",
  "rx-deploy-container",
  "quick-check",
  "memory-snapshot",
  "handoff-reminder",
  "context-nudge",
];

/** General items that suit React front-end work, added to core in the react profile. */
export const REACT_EXTRAS: readonly string[] = [
  "rx-ui",
  "rx-test-writer",
  "rx-react-web",
  "rx-ui-kit",
  "rx-e2e",
  "rx-tdd",
  "quick-check",
  "memory-snapshot",
  "handoff-reminder",
  "context-nudge",
];

/** General items that suit quality assurance, added to core in the qa profile. */
export const QA_EXTRAS: readonly string[] = [
  "rx-test-writer",
  "rx-security",
  "rx-e2e",
  "rx-tdd",
  "rx-theme-audit",
  "rx-security-sweep",
  "quick-check",
  "memory-snapshot",
  "handoff-reminder",
  "context-nudge",
];

/** General items that suit marketing and running the product, added to core in the marketing profile. */
export const MARKETING_EXTRAS: readonly string[] = [
  "rx-pitch",
  "rx-doc-writer",
  "rx-researcher",
  "rx-demo",
  "rx-kickoff",
  "quick-check",
  "memory-snapshot",
  "handoff-reminder",
  "context-nudge",
];

/** Whether an item belongs to the .NET, EF Core and Datadog set. */
export const isDotnetItem = (name: string): boolean =>
  /^rx-(dotnet|efcore|datadog)(-|$)/.test(name) || name === "rx-observability";
