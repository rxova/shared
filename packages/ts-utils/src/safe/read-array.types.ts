export interface ReadArrayOptions {
  /**
   * What an item `readItem` returned `undefined` for means.
   *
   * `reject` (default): the whole list is bad, and `readArray` returns
   * `undefined` — the right answer for a field whose every entry matters.
   * `skip`: the item is dropped and the rest are kept, for a list where one
   * unreadable entry is not worth losing the others over.
   */
  readonly onInvalid?: "reject" | "skip";
}
