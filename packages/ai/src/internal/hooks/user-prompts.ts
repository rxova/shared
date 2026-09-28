import { messageBlocks } from '@/internal/hooks/message-blocks';

/** The text the user typed, in order: user entries' text blocks, not tool results. */
export const userPrompts = (entries: readonly Record<string, unknown>[]): string[] =>
  entries
    .filter((entry) => entry.type === 'user')
    .map((entry) =>
      messageBlocks(entry)
        .filter((block) => block.type === 'text' && typeof block.text === 'string')
        .map((block) => (block.text as string).trim())
        .join('\n'),
    )
    .filter((text) => text !== '' && !text.startsWith('<'));
