import { isRecord } from '@/internal/config/is-record';

/** What npm printed on stderr when a child process failed, else the error's own message. */
export const npmFailureReason = (failure: unknown): string => {
  const stderr = isRecord(failure) ? failure.stderr : undefined;
  const text =
    typeof stderr === 'string' ? stderr : Buffer.isBuffer(stderr) ? stderr.toString('utf8') : '';
  if (text.trim() !== '') return text.trim();
  return failure instanceof Error ? failure.message : String(failure);
};
