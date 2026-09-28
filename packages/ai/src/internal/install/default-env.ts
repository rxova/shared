import { homedir } from 'node:os';
import type { InstallEnv } from '@/install/install.types';
import { consoleIo } from '@/internal/cli/console-io';
import { packageRoot } from '@/internal/cli/package-root';

/** The real home, working directory, package and console. */
export const defaultEnv = (): InstallEnv => ({
  home: homedir(),
  cwd: process.cwd(),
  packageDir: packageRoot(import.meta.url),
  io: consoleIo,
});
