import { isRecord } from '@/internal/install/is-record';

/**
 * A transcript entry's message content as blocks: a plain string becomes one text block, and
 * anything that is not a block is dropped.
 */
export const messageBlocks = (entry: Record<string, unknown>): Record<string, unknown>[] => {
  const message = entry.message;
  if (!isRecord(message)) return [];
  const { content } = message;
  if (typeof content === 'string') return [{ type: 'text', text: content }];
  return Array.isArray(content) ? content.filter(isRecord) : [];
};
