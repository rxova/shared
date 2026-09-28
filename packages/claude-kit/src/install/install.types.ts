import type { Io } from '@/cli/cli.types';
import type { HookEvent } from '@/hooks/hook.types';

/** What an install wrote, kept in `<target>/rx-ai/manifest.json` so uninstall removes exactly that. */
export interface Manifest {
  version: string;
  /** The profile the selection started from. */
  profile: string;
  /** The agents, skills and hooks installed, by name. */
  items: string[];
  /** Paths relative to the target, with `/` separators. */
  files: string[];
  /** Whether the first install created `settings.json`, so uninstall may remove it again. */
  createdSettings: boolean;
}

/** One file the install copies: from the package, to a path relative to the target. */
export interface Copy {
  from: string;
  to: string;
}

export interface InstallPlan {
  copies: Copy[];
  /** Target-relative paths that exist but that no earlier install wrote. */
  conflicts: string[];
}

/** Something the kit can install. */
export interface CatalogItem {
  name: string;
  kind: 'agent' | 'skill' | 'hook';
  summary: string;
}

/** One `hooks[event][]` entry of a Claude Code settings file. */
export interface HookGroup {
  matcher?: string;
  hooks: { type: 'command'; command: string; timeout: number }[];
}

/** The kit's hook entries, by event. */
export type HookGroups = Partial<Record<HookEvent, HookGroup[]>>;

/** Where a command reads from and writes to; real values by default, fakes in tests. */
export interface InstallEnv {
  home: string;
  cwd: string;
  /** This package's root, holding `content/` and `dist/`. */
  packageDir: string;
  io: Io;
}
