/** The H1 and summary blockquote llmstxt.org puts at the top of both files. */
export const llmsHead = (project: string, summary: readonly string[]): string[] => [
  `# ${project}`,
  "",
  ...summary.map((line) => `> ${line}`),
  "",
];
