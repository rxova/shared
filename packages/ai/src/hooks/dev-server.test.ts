import { describe, expect, it } from 'vitest';
import { devServer } from '@/hooks/dev-server';
import { bash, contextWith } from '@/internal/hooks/context.fixtures';

const blocked = (command: string, extra: Record<string, unknown> = {}) =>
  devServer(bash(command, '/repo', extra), contextWith()).block;

describe('devServer', () => {
  it.each([
    'npm run dev',
    'pnpm dev',
    'yarn start',
    'bun run preview',
    'PORT=3001 pnpm run dev',
    'npx next dev',
    'vite',
    'astro dev',
    'expo start',
    'uvicorn app.main:app --reload',
    'fastapi dev main.py',
    'flask run',
    'python manage.py runserver',
    'wrangler dev',
    'docker compose up',
    'tsc --watch',
    'tsc -w',
    'fastapi run app.py',
    'nodemon server.js',
    'cd web && pnpm dev',
  ])('blocks %s in the foreground', (command) => {
    expect(blocked(command)).toBe(true);
  });

  it.each([
    'pnpm build',
    'npm test',
    'npm run lint',
    'vite build',
    'next build',
    'docker compose up -d',
    'docker compose up --detach',
    'python script.py',
    'npx prettier --check .',
    'expo export',
    'FOO=1',
    'pnpm',
    'fastapi --help',
  ])('allows %s', (command) => {
    expect(blocked(command)).toBe(false);
  });

  it('allows a server started in the background', () => {
    expect(blocked('pnpm dev', { run_in_background: true })).toBe(false);
    expect(blocked('pnpm dev &')).toBe(false);
  });

  it('says how to run it instead', () => {
    expect(devServer(bash('pnpm dev'), contextWith())).toEqual({
      block: true,
      reason: expect.stringContaining('run_in_background') as string,
    });
  });

  it('ignores every tool but Bash', () => {
    expect(
      devServer({ tool_name: 'Edit', tool_input: { command: 'pnpm dev' } }, contextWith()).block,
    ).toBe(false);
  });
});
