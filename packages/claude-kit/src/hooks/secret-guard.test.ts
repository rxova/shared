import { describe, expect, it } from 'vitest';
import type { HookInput } from '@/hooks/hook.types';
import { secretGuard } from '@/hooks/secret-guard';
import { contextWith } from '@/internal/hooks/context.fixtures';

// Every fake credential is assembled at run time, so no scanner mistakes this file for a leak.
const repeat = (text: string, times: number) => text.repeat(times);
const jwt = (payload: object) =>
  [
    Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    repeat('s1gn', 8),
  ].join('.');
const FAKES = {
  aws: ['AK', 'IA', repeat('Z', 16)].join(''),
  privateKey: ['-----BEGIN ', 'PRIVATE KEY-----'].join(''),
  anthropic: ['sk', 'ant', repeat('a1B2', 8)].join('-'),
  openai: ['sk', 'proj', repeat('x9Y8', 10)].join('-'),
  stripe: ['sk', 'live', repeat('Qw3r', 6)].join('_'),
  github: ['gh', 'p_', repeat('A1', 20)].join(''),
  slack: ['xo', 'xb-', repeat('12ab-', 4)].join(''),
  google: ['AI', 'za', repeat('C', 35)].join(''),
  supabase: ['sb', 'secret', repeat('k7', 12)].join('_'),
  serviceRole: jwt({ role: 'service_role', iss: 'supabase' }),
  datadog: ['DD', 'API', 'KEY='].join('_') + repeat('0a1b', 8),
  azure: 'AccountKey=' + repeat('Ab9+', 21) + 'xy==',
};

const write = (file_path: string, content: string): HookInput => ({
  tool_name: 'Write',
  tool_input: { file_path, content },
});
const blocked = (input: HookInput) => secretGuard(input, contextWith()).block;

describe('secretGuard', () => {
  it.each(Object.entries(FAKES))('blocks %s written into a source file', (_, secret) => {
    expect(blocked(write('/repo/src/config.ts', `export const key = '${secret}';`))).toBe(true);
  });

  it('reads Edit and MultiEdit changes too', () => {
    expect(
      blocked({
        tool_name: 'Edit',
        tool_input: { file_path: '/r/a.py', new_string: `KEY = "${FAKES.aws}"` },
      }),
    ).toBe(true);
    expect(
      blocked({
        tool_name: 'MultiEdit',
        tool_input: {
          file_path: '/r/a.ts',
          edits: [{ new_string: 'ok' }, null, { new_string: FAKES.github }],
        },
      }),
    ).toBe(true);
  });

  it('allows secrets in local env files, but not in their templates', () => {
    expect(blocked(write('/repo/.env', `ANTHROPIC_API_KEY=${FAKES.anthropic}`))).toBe(false);
    expect(blocked(write('/repo/.env.local', `AWS_ACCESS_KEY_ID=${FAKES.aws}`))).toBe(false);
    expect(blocked(write('/repo/.env.example', `ANTHROPIC_API_KEY=${FAKES.anthropic}`))).toBe(true);
  });

  it.each([
    'const key = process.env.ANTHROPIC_API_KEY;',
    'sk-ant-short',
    jwt({ role: 'anon' }),
    'eyJhbGciOi.notbase64!.x',
    `${repeat('eyJ', 1)}${repeat('_', 10)}.${repeat('eyJ', 1)}${repeat('-', 10)}.${repeat('a', 10)}`,
  ])('allows %s', (content) => {
    expect(blocked(write('/repo/src/a.ts', content))).toBe(false);
  });

  it('says where the secret should go instead', () => {
    expect(secretGuard(write('/repo/src/a.ts', FAKES.stripe), contextWith())).toEqual({
      block: true,
      reason: expect.stringContaining('.env.example') as string,
    });
  });

  it('ignores calls without a file path, and tools that write nothing', () => {
    expect(blocked({ tool_name: 'Write', tool_input: { content: FAKES.aws } })).toBe(false);
    expect(blocked({ tool_name: 'Read', tool_input: { file_path: '/r/a.ts' } })).toBe(false);
    expect(blocked({ tool_name: 'Write', tool_input: { file_path: '/r/a.ts', content: 42 } })).toBe(
      false,
    );
    expect(
      blocked({ tool_name: 'MultiEdit', tool_input: { file_path: '/r/a.ts', edits: 'x' } }),
    ).toBe(false);
  });
});
