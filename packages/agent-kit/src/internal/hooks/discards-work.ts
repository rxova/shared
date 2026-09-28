import type { GitCall } from '@/internal/shell/shell.types';

/**
 * Whether the git call throws away uncommitted changes: `reset --hard`, `clean -f…`,
 * `checkout -- <paths>` / `checkout .`, `restore` of the working tree, `stash drop|clear`.
 */
export const discardsWork = ({ subcommand, args }: GitCall): boolean => {
  switch (subcommand) {
    case 'reset':
      return args.includes('--hard');
    case 'clean':
      return args.some((arg) => arg === '--force' || /^-[^-]*f/.test(arg));
    case 'checkout':
      return args.includes('--') || args.includes('.');
    case 'restore':
      return !args.includes('--staged') || args.includes('--worktree');
    case 'stash':
      return args[0] === 'drop' || args[0] === 'clear';
    default:
      return false;
  }
};
