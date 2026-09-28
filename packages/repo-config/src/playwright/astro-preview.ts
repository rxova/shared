/**
 * The `webServer` command that serves an Astro app's built `dist` on `port`,
 * beside any preview already running (`--ignore-lock`).
 */
export const astroPreview = (port: number): string =>
  `astro preview --port ${String(port)} --ignore-lock`;
