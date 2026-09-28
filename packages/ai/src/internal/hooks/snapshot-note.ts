/** What an automatic snapshot records. */
export interface Snapshot {
  event: string;
  at: string;
  branch: string | undefined;
  status: string | undefined;
  commits: string | undefined;
  edited: readonly string[];
  prompts: readonly string[];
}

/** An automatic snapshot as a short Markdown note. */
export const snapshotNote = ({
  event,
  at,
  branch,
  status,
  commits,
  edited,
  prompts,
}: Snapshot): string => {
  const section = (title: string, body: string | undefined) =>
    body ? [`## ${title}`, '', body, ''] : [];
  const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join('\n');
  return [
    `# Snapshot (${event}, ${at})`,
    '',
    'Written automatically; for a real handoff, use the rx-handoff skill.',
    '',
    ...section('Branch', branch && `\`${branch}\``),
    ...section(
      'Uncommitted',
      status && `\`\`\`\n${status.split('\n').slice(0, 30).join('\n')}\n\`\`\``,
    ),
    ...section('Recent commits', commits && `\`\`\`\n${commits}\n\`\`\``),
    ...section('Files edited this session', list(edited)),
    ...section(
      'Recent requests',
      list(
        prompts.map((prompt) =>
          (prompt.length > 300 ? `${prompt.slice(0, 300)}…` : prompt).replace(/\s+/g, ' '),
        ),
      ),
    ),
  ].join('\n');
};
