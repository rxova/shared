import type { Io } from '@/cli/cli.types';

/** What an install wrote, kept in `<target>/rx-ai/manifest.json` so uninstall removes exactly that. */
export interface Manifest {
  version: string;
  /** Paths relative to the target, with `/` separators. */
  files: string[];
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

/** One `hooks[event][]` entry of a Claude Code settings file. */
export interface HookGroup {
  matcher: string;
  hooks: { type: 'command'; command: string; timeout: number }[];
}

/** Where a command reads from and writes to; real values by default, fakes in tests. */
export interface InstallEnv {
  home: string;
  cwd: string;
  /** This package's root, holding `content/` and `dist/`. */
  packageDir: string;
  io: Io;
}
