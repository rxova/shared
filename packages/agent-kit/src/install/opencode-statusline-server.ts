/**
 * The status line plugin's server entry. OpenCode loads a plugin in both runtimes, and the
 * server one has no `context.ui` to draw into, so this does nothing and says so rather than
 * failing the load. The drawing lives in the `./tui` entry.
 */
export const opencodeStatuslineServer = (): string =>
  `// rx-statusline: the server half, which has nothing to draw. Written by rxova-agent-kit install; reinstall to change it.
export default {
  id: 'rx-statusline',
  setup() {},
};
`;
