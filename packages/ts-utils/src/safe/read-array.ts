import { arrayItems } from "@/safe/array-items";
import type { ReadArrayOptions } from "@/safe/read-array.types";

/**
 * Reads an array out of untrusted JSON, item by item, with one rule for what
 * an unreadable item means.
 *
 * `readItem` returns the value it read, or `undefined` for "I cannot read
 * this"; `onInvalid` decides whether that loses the item or the list.
 * Anything that is not an array is `undefined`, never an empty array, so
 * "absent" and "empty" stay apart — write `?? []` where they should not. The
 * array is snapshotted through `arrayItems` before anything is read, so a
 * hostile proxy cannot change it underneath the walk or throw partway.
 *
 * `undefined` is also a legitimate item to read, in which case it reads as
 * invalid; a reader that needs to keep one should return a marker instead.
 */
export const readArray = <Item>(
  value: unknown,
  readItem: (item: unknown, index: number) => Item | undefined,
  { onInvalid = "reject" }: ReadArrayOptions = {},
): Item[] | undefined => {
  const items = arrayItems(value);
  if (items === undefined) return undefined;

  const read: Item[] = [];
  for (const [index, item] of items.entries()) {
    const value_ = readItem(item, index);
    if (value_ === undefined) {
      if (onInvalid === "reject") return undefined;
      continue;
    }
    read.push(value_);
  }
  return read;
};
