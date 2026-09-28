import { ghCall } from '@/internal/shell/gh-call';
import { gitCall } from '@/internal/shell/git-call';
import { optionValues } from '@/internal/shell/option-values';

/**
 * For a `git commit` or `gh pr create|edit` call, the message or body files it reads (possibly
 * none); undefined for any other call.
 */
export const messageFiles = (words: readonly string[]): string[] | undefined => {
  const git = gitCall(words);
  if (git?.subcommand === 'commit') return optionValues(git.args, ['-F', '--file']);
  const gh = ghCall(words);
  if (gh?.command[0] === 'pr' && (gh.command[1] === 'create' || gh.command[1] === 'edit'))
    return optionValues(gh.args, ['-F', '--body-file']);
  return undefined;
};
