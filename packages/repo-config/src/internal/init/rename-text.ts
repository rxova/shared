import type { Rename } from "@/init/init.types";

/** Applies every rename to `text`, in order, each to every occurrence. */
export const renameText = (text: string, renames: readonly Rename[]): string =>
  renames.reduce((current, [from, to]) => current.replaceAll(from, to), text);
