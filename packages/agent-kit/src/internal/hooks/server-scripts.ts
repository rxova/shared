// Package-manager scripts that usually start a server and never exit.
export const SERVER_SCRIPTS = new Set(["dev", "start", "serve", "preview", "watch"]);

export const RUNNERS = new Set(["npm", "pnpm", "yarn", "bun"]);
