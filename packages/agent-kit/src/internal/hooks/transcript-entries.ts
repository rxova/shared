import { isRecord } from '@/internal/install/is-record';

/** The objects of a JSONL transcript, skipping lines that are not JSON objects. */
export const transcriptEntries = (text: string): Record<string, unknown>[] =>
  text.split('\n').flatMap((line) => {
    if (line.trim() === '') return [];
    try {
      const value: unknown = JSON.parse(line);
      return isRecord(value) ? [value] : [];
    } catch {
      return [];
    }
  });
