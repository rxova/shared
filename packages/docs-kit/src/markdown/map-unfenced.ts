import { FENCE } from '@/internal/markdown/fence';

/**
 * Applies `fn` to the runs of a document outside code fences, leaving every
 * fence byte for byte as it was.
 *
 * Every rule that rewrites docs content goes through here, because the fences
 * are the one part a reader wants verbatim: they are the snippets, and they
 * legitimately hold `import` lines, root-relative paths and component tags a
 * blind rewrite would gut. `onFenceOpen` sees each opening fence line, whose
 * info string is not fence content, so a caller may rewrite it.
 *
 * A fence closes on the same character, at least as long, with no info string;
 * anything else inside is content that merely looks like a fence.
 */
export const mapUnfenced = (
  text: string,
  fn: (chunk: string) => string,
  onFenceOpen: (line: string) => string = (line) => line,
): string => {
  const out: string[] = [];
  let buffer: string[] = [];
  let marker: string | undefined;

  const flush = () => {
    if (buffer.length > 0) out.push(fn(buffer.join('\n')));
    buffer = [];
  };

  for (const line of text.split('\n')) {
    const match = FENCE.exec(line);
    const fence = match?.[2];
    if (marker === undefined) {
      if (fence === undefined) {
        buffer.push(line);
      } else {
        flush();
        marker = fence;
        out.push(onFenceOpen(line));
      }
      continue;
    }
    out.push(line);
    if (
      fence !== undefined &&
      fence.startsWith(marker.charAt(0)) &&
      fence.length >= marker.length &&
      match?.[3]?.trim() === ''
    ) {
      marker = undefined;
    }
  }

  flush();
  return out.join('\n');
};
