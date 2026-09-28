import { ATTRIBUTION } from '@/internal/hooks/attribution-patterns';

/** Whether the text credits an AI assistant in a trailer, footer or badge. */
export const carriesAttribution = (text: string): boolean =>
  ATTRIBUTION.some((pattern) => pattern.test(text));
