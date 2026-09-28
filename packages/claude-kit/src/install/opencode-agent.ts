/**
 * A Claude Code agent file rewritten for OpenCode: `mode: subagent`, the description quoted, and
 * the `tools` list turned into a `permission` block that denies what the agent was not given
 * (editing, the shell, the web). An agent without a `tools` line keeps every permission, as it
 * kept every tool. The model is left to OpenCode, which runs a subagent on the caller's model
 * unless told otherwise; the body is unchanged.
 */
export const opencodeAgent = (markdown: string): string => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(markdown);
  const header = match?.[1] ?? '';
  const body = match?.[2] ?? markdown;
  const field = (key: string) => new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(header)?.[1]?.trim();

  const lines = [
    '---',
    `description: ${JSON.stringify(field('description') ?? '')}`,
    'mode: subagent',
  ];
  const tools = field('tools');
  if (tools !== undefined) {
    const granted = new Set(tools.split(',').map((tool) => tool.trim()));
    const denied = [
      ['edit', ['Edit', 'Write', 'MultiEdit', 'NotebookEdit']],
      ['bash', ['Bash']],
      ['webfetch', ['WebFetch']],
      ['websearch', ['WebSearch']],
    ].filter(([, names]) => !(names as string[]).some((name) => granted.has(name)));
    if (denied.length > 0)
      lines.push('permission:', ...denied.map(([key]) => `  ${String(key)}: deny`));
  }
  return `${[...lines, '---'].join('\n')}\n${body.startsWith('\n') ? '' : '\n'}${body}`;
};
