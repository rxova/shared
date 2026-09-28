import { leadingAssignments } from '@/internal/shell/leading-assignments';
import { programName } from '@/internal/shell/program-name';
import { RUNNERS, SERVER_SCRIPTS } from '@/internal/hooks/server-scripts';

/** Whether the words start a process that keeps running until stopped: a dev server or watcher. */
export const longRunning = (words: readonly string[]): boolean => {
  const start = leadingAssignments(words);
  const program = programName(words[start] ?? '');
  const args = words.slice(start + 1);
  const script = args[0] === 'run' ? args[1] : args[0];
  if (RUNNERS.has(program)) return SERVER_SCRIPTS.has(script ?? '');
  if (program === 'npx' || program === 'bunx') return longRunning(args);
  if (['next', 'astro', 'nuxt', 'remix', 'wrangler', 'vercel', 'netlify'].includes(program))
    return args[0] === 'dev';
  if (program === 'vite')
    return args.length === 0 || args[0] === 'dev' || args[0] === 'serve' || args[0] === 'preview';
  if (program === 'expo') return args[0] === 'start';
  if (program === 'uvicorn' || program === 'nodemon') return true;
  if (program === 'fastapi') return args[0] === 'dev' || args[0] === 'run';
  if (program === 'flask') return args[0] === 'run';
  if (program === 'python' || program === 'python3')
    return args[0] === 'manage.py' && args[1] === 'runserver';
  if (program === 'docker')
    return args.includes('up') && !args.includes('-d') && !args.includes('--detach');
  if (program === 'tsc') return args.includes('--watch') || args.includes('-w');
  return false;
};
