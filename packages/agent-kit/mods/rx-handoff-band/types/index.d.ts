export type HandoffNote = { path: string; date: string; ageDays: number };

declare module "claude-code" {
  interface PluginState {
    "rx-handoff-band": { note: HandoffNote | null; isHidden: boolean };
  }
}
