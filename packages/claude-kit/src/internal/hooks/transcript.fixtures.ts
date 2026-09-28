/** A JSONL transcript: two user prompts, edits and a read by the assistant, usage on each turn. */
export const transcript = (inputTokens = 1000): string =>
  [
    { type: 'user', message: { role: 'user', content: 'Add a login page' } },
    {
      type: 'assistant',
      message: {
        role: 'assistant',
        content: [
          { type: 'text', text: 'On it.' },
          { type: 'tool_use', name: 'Write', input: { file_path: '/repo/src/login.tsx' } },
          { type: 'tool_use', name: 'Read', input: { file_path: '/repo/src/app.tsx' } },
        ],
        usage: { input_tokens: 10, cache_read_input_tokens: 20 },
      },
    },
    { type: 'user', message: { role: 'user', content: [{ type: 'tool_result', content: 'ok' }] } },
    'not json',
    '[1]',
    {
      type: 'user',
      message: { role: 'user', content: [{ type: 'text', text: `  ${'x'.repeat(400)}  ` }] },
    },
    { type: 'user', message: { role: 'user', content: '<command-name>/clear</command-name>' } },
    { type: 'user', message: 'odd' },
    { type: 'user', message: { role: 'user', content: 42 } },
    {
      type: 'assistant',
      message: {
        role: 'assistant',
        content: [
          { type: 'tool_use', name: 'Edit', input: { file_path: '/repo/src/login.tsx' } },
          { type: 'tool_use', name: 'NotebookEdit', input: { notebook_path: '/repo/n.ipynb' } },
          { type: 'tool_use', name: 'Edit', input: 'odd' },
          'odd',
        ],
        usage: { input_tokens: inputTokens, cache_creation_input_tokens: 'x' },
      },
    },
  ]
    .map((entry) => (typeof entry === 'string' ? entry : JSON.stringify(entry)))
    .join('\n');
