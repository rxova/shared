import type { OpencodeHooks } from "@/install/opencode-hooks";

/**
 * The OpenCode plugin the installer writes to `plugins/rx-kit.js`: plain ES module JavaScript that
 * OpenCode loads with Bun. It turns OpenCode's tool calls into the Claude Code hook input the
 * runner reads (`filePath` → `file_path`, one input per file of an `apply_patch`), runs the chosen
 * hooks through the installed runner with the runtime OpenCode itself runs on, and maps the
 * outcome back: a block throws (OpenCode shows the error to the model), a lint report is appended
 * to the tool's output, and the session-start reminder is added to the system prompt once.
 * Only the plugin function is exported, as OpenCode treats every exported function as a plugin.
 */
export const opencodePlugin = (
  runner: string,
  grouped: OpencodeHooks,
): string => `// rx-kit: runs the rxova agent-kit hooks inside OpenCode. Written by rxova-agent-kit install; reinstall to change it.
import { spawn } from 'node:child_process';

const RUNNER = ${JSON.stringify(runner)};
const HOOKS = ${JSON.stringify(grouped)};

const run = (names, input) =>
  new Promise((resolve) => {
    if (names.length === 0) return resolve({ code: 0, stdout: '', stderr: '' });
    const child = spawn(process.execPath, [RUNNER, names.join(',')], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', () => resolve({ code: 0, stdout: '', stderr: '' }));
    child.on('close', (code) => resolve({ code: code ?? 0, stdout, stderr }));
    child.stdin.end(JSON.stringify(input));
  });

const matching = (groups, tool) =>
  groups
    .filter(({ matcher }) => matcher === '*' || new RegExp('^(' + matcher + ')$').test(tool))
    .flatMap(({ names }) => names);

const patchFiles = (text) => {
  const files = [];
  for (const line of text.split('\\n')) {
    const header = /^\\*\\*\\* (?:Add|Update) File: (.+)$/.exec(line);
    if (header) files.push({ path: header[1].trim(), added: '' });
    else if (line.startsWith('+') && files.length > 0) files[files.length - 1].added += line.slice(1) + '\\n';
  }
  return files;
};

// OpenCode's tool arguments as the Claude Code tool inputs the hooks read.
const inputsFor = (tool, args = {}) => {
  if (tool === 'bash') return [{ tool_name: 'Bash', tool_input: { command: args.command } }];
  if (tool === 'write') return [{ tool_name: 'Write', tool_input: { file_path: args.filePath, content: args.content } }];
  if (tool === 'edit')
    return [{ tool_name: 'Edit', tool_input: { file_path: args.filePath, old_string: args.oldString, new_string: args.newString } }];
  if (tool === 'apply_patch')
    return patchFiles(String(args.patchText ?? '')).map(({ path, added }) => ({
      tool_name: 'Edit',
      tool_input: { file_path: path, new_string: added },
    }));
  return [];
};

export const RxKit = async ({ directory }) => {
  const pending = new Map();
  const base = (sessionID, event) => ({ hook_event_name: event, session_id: sessionID, cwd: directory });
  return {
    'tool.execute.before': async (input, output) => {
      for (const call of inputsFor(input.tool, output.args)) {
        const result = await run(matching(HOOKS.before, call.tool_name), { ...base(input.sessionID, 'PreToolUse'), ...call });
        if (result.code === 2) throw new Error(result.stderr.trim());
      }
    },
    'tool.execute.after': async (input, output) => {
      for (const call of inputsFor(input.tool, input.args)) {
        const result = await run(matching(HOOKS.after, call.tool_name), { ...base(input.sessionID, 'PostToolUse'), ...call });
        if (result.code === 2 && result.stderr.trim() !== '') output.output = output.output + '\\n\\n' + result.stderr.trim();
      }
    },
    'experimental.session.compacting': async (input) => {
      await run(HOOKS.compacting, base(input.sessionID, 'PreCompact'));
    },
    event: async ({ event }) => {
      if (event.type !== 'session.created' || event.properties?.info?.parentID) return;
      const id = event.properties?.info?.id;
      const result = await run(HOOKS.start, base(id, 'SessionStart'));
      if (id && result.stdout.trim() !== '') pending.set(id, result.stdout.trim());
    },
    'experimental.chat.system.transform': async (input, output) => {
      const text = input.sessionID === undefined ? undefined : pending.get(input.sessionID);
      if (text === undefined) return;
      pending.delete(input.sessionID);
      output.system.push(text);
    },
  };
};
`;
