import { existsSync, readdirSync, readFileSync } from "node:fs";
import type { WorkspaceFiles } from "@/node-floor/node-floor.types";

/** The workspace on disk: a missing directory lists as empty, a missing file reads as nothing. */
export const workspaceFiles: WorkspaceFiles = {
  list: (dir) => (existsSync(dir) ? readdirSync(dir) : []),
  read: (file) => (existsSync(file) ? readFileSync(file, "utf8") : undefined),
};
