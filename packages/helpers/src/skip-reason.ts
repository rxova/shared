import type { Request } from '../../tooling/src/changeset.types.ts';
import { SKIP_LABEL } from './skip-label.ts';

/** Why the pull request asked to be excused from a changeset, or nothing when it did not. */
export const skipReason = ({ labels = [], title = '' }: Request): string | undefined => {
  if (labels.includes(SKIP_LABEL)) return `\`${SKIP_LABEL}\` set on this pull request`;
  if (title.includes(`[${SKIP_LABEL}]`)) return `\`[${SKIP_LABEL}]\` in the pull request title`;
  return undefined;
};
