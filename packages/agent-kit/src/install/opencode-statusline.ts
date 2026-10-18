import { pathToFileURL } from "node:url";

/**
 * The OpenCode status line plugin the installer writes to `plugin/rx-statusline/index.js`: plain
 * ES module JavaScript, so nothing has to compile it on the way in. It holds no layout of its
 * own — `rows` is the same builder the Claude Code script renders, so both hosts drop the same
 * segments in the same order — and only turns each cell into a span OpenTUI can draw.
 *
 * OpenCode resolves `@opencode/plugin/tui`, `@opentui/solid` and `solid-js` itself, which is why
 * this package depends on none of them. The rows module is imported by absolute path because the
 * plugin sits in the user's config directory rather than beside the package, and as a `file:`
 * URL because a bare Windows path is not a valid module specifier.
 *
 * `rows` is a pure function of the facts, so the plugin re-reads them on the host's own events
 * rather than on a timer: a usage update, a finished turn, or a model change repaints, and
 * nothing else does.
 */
export const opencodeStatusline = (rowsModule: string, slot: string): string =>
  `// rx-statusline: the rxova agent-kit status line inside OpenCode. Written by rxova-agent-kit install; reinstall to change it.
import { Plugin } from '@opencode/plugin/tui';
import { jsx } from '@opentui/solid/jsx-runtime';
import { createSignal } from 'solid-js';
import { opencodeFacts, opencodeRows } from ${JSON.stringify(pathToFileURL(rowsModule).href)};

const REPAINT_ON = [
  'session.usage.updated',
  'session.idle',
  'session.model.selected',
  'session.execution.succeeded',
  'session.execution.failed',
  'session.execution.interrupted',
];

export default Plugin.define({
  id: 'rx-statusline',
  setup(context) {
    const [version, bump] = createSignal(0, { equals: false });
    const repaint = () => { bump((value) => value + 1); };
    const stops = REPAINT_ON.map((type) => context.data.on(type, repaint));

    const cell = (part) =>
      part.href
        ? jsx('a', { href: part.href, style: { fg: part.fg, bold: part.bold }, children: part.text })
        : jsx('span', { style: { fg: part.fg, bold: part.bold }, children: part.text });

    const session = (sessionID) => {
      const info = sessionID === undefined ? undefined : context.data.session.get(sessionID);
      const last = sessionID === undefined ? [] : context.data.session.message.list(sessionID);
      const usage = last.length === 0 ? undefined : last[last.length - 1];
      const place = context.location ?? context.data.location.default();
      return {
        sessionId: sessionID,
        model: info?.model?.name ?? info?.model?.modelID,
        cwd: place?.directory,
        projectDir: place?.directory,
        tokens: usage?.tokens,
        contextSize: info?.model?.limit?.context,
        costUsd: sessionID === undefined ? undefined : context.data.session.cost(sessionID),
        startedAt: info?.time?.created === undefined ? undefined : Math.floor(info.time.created / 1000),
        columns: context.renderer?.width,
      };
    };

    const render = (input) => {
      // Read the signal so the row rebuilds whenever the host says something moved.
      version();
      const current = session(input?.sessionID);
      const rows = opencodeRows(current, opencodeFacts(current));
      return jsx('box', {
        flexDirection: 'column',
        children: rows.map((parts) => jsx('text', { wrapMode: 'none', children: parts.map(cell) })),
      });
    };

    context.ui.slot({ append: ${JSON.stringify(slot)}, render });
    return () => { for (const stop of stops) stop(); };
  },
});
`;
