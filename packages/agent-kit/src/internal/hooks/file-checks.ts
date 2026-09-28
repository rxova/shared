import { extname, join } from 'node:path';
import type { HookContext } from '@/hooks/hook.types';
import { FORMATTED, LINTED } from '@/internal/hooks/checked-extensions';

/** A program and its arguments, run from the project root. */
export interface Check {
  program: string;
  args: string[];
  /** Whether a non-zero exit means problems to report (a linter) or can be ignored (a formatter). */
  reports: boolean;
}

/**
 * The format and lint commands for one file, from the tools the project has installed: Biome, or
 * else Prettier and ESLint, for web files; Ruff for Python (from the project's `.venv`, or PATH);
 * `dotnet format whitespace` for C#, which needs no build (analyzer checks do, so they are left out).
 */
export const fileChecks = (file: string, root: string, context: HookContext): Check[] => {
  const ext = extname(file);
  const bin = (name: string) => join(root, 'node_modules', '.bin', name);
  const has = (name: string) => context.exists(bin(name));

  if (ext === '.cs')
    return [
      {
        program: 'dotnet',
        args: ['format', 'whitespace', root, '--folder', '--include', file],
        reports: false,
      },
    ];
  if (ext === '.py') {
    const venv = join(root, '.venv', 'bin', 'ruff');
    const ruff = context.exists(venv) ? venv : 'ruff';
    return [
      { program: ruff, args: ['format', file], reports: false },
      { program: ruff, args: ['check', '--quiet', file], reports: true },
    ];
  }
  if (!FORMATTED.has(ext)) return [];
  if (has('biome'))
    return [
      { program: bin('biome'), args: ['format', '--write', file], reports: false },
      ...(LINTED.has(ext) ? [{ program: bin('biome'), args: ['lint', file], reports: true }] : []),
    ];
  return [
    ...(has('prettier')
      ? [
          {
            program: bin('prettier'),
            args: ['--write', '--log-level', 'warn', file],
            reports: false,
          },
        ]
      : []),
    ...(has('eslint') && LINTED.has(ext)
      ? [{ program: bin('eslint'), args: ['--no-warn-ignored', file], reports: true }]
      : []),
  ];
};
