export type Worktree = {
  path: string;
  branch: string;
  isPrunable: boolean;
  pr: { number: number; state: string } | null;
};

export type WorktreesView = {
  rows: Worktree[];
  error: string | null;
  isLoading: boolean;
};

declare module "claude-code" {
  interface PluginState {
    "rx-worktrees": { view: WorktreesView };
  }
}
