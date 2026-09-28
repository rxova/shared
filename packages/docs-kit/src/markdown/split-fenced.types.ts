export interface SplitDocument {
  /** Every run outside a fence, joined by newlines. */
  readonly unfenced: string;
  /** Each opening fence line, info string included. */
  readonly openers: readonly string[];
}
