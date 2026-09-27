/** The only file access node-floor needs. Injected for tests. */
export interface WorkspaceFiles {
  list: (dir: string) => string[];
  read: (file: string) => string | undefined;
}

export interface Published {
  dir: string;
  name: string;
  floor: string;
}
