/** Runs a command and returns its stdout. Injected for tests. */
export type Shell = (command: string, args: string[], cwd: string) => string;

/** The scratch directory pack-smoke installs into. Injected for tests. */
export interface ScratchFiles {
  make: () => string;
  list: (dir: string) => string[];
  read: (file: string) => string;
  write: (file: string, contents: string) => void;
  remove: (dir: string) => void;
}
