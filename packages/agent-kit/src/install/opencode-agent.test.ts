import { describe, expect, it } from 'vitest';
import { opencodeAgent } from '@/install/opencode-agent';

const agent = (tools: string | undefined, description = 'Reviews code, carefully') =>
  [
    '---',
    'name: rx-x',
    `description: ${description}`,
    ...(tools === undefined ? [] : [`tools: ${tools}`]),
    'model: sonnet',
    '---',
    '',
    'You review.',
    '',
  ].join('\n');

describe('opencodeAgent', () => {
  it('makes a read-only agent a subagent that may not edit, run commands or use the web', () => {
    expect(opencodeAgent(agent('Read, Grep, Glob'))).toBe(
      [
        '---',
        'description: "Reviews code, carefully"',
        'mode: subagent',
        'permission:',
        '  edit: deny',
        '  bash: deny',
        '  webfetch: deny',
        '  websearch: deny',
        '---',
        '',
        'You review.',
        '',
      ].join('\n'),
    );
  });

  it('keeps what the agent was given', () => {
    const out = opencodeAgent(agent('Read, Grep, Glob, Bash, Edit, Write, WebSearch, WebFetch'));
    expect(out).not.toContain('permission:');
    expect(opencodeAgent(agent('Read, Bash, WebSearch'))).toContain(
      'permission:\n  edit: deny\n  webfetch: deny\n---',
    );
  });

  it('keeps every permission for an agent without a tools line, and quotes awkward descriptions', () => {
    const out = opencodeAgent(agent(undefined, 'Checks "things": fast'));
    expect(out).toContain('description: "Checks \\"things\\": fast"\nmode: subagent\n---');
    expect(out).not.toContain('permission');
  });

  it('copes with a file that has no frontmatter', () => {
    expect(opencodeAgent('Just a body')).toBe(
      '---\ndescription: ""\nmode: subagent\n---\n\nJust a body',
    );
  });
});
