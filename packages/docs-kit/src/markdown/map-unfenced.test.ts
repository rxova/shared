import { describe, expect, it } from 'vitest';
import { mapUnfenced } from '@/markdown/map-unfenced';

const upper = (chunk: string) => chunk.toUpperCase();

describe('mapUnfenced', () => {
  it('rewrites prose and leaves fences alone', () => {
    const doc = ['a', '```ts', 'import x', '```', 'b'].join('\n');
    expect(mapUnfenced(doc, upper)).toBe(['A', '```ts', 'import x', '```', 'B'].join('\n'));
  });

  it('handles tilde fences and indented fences', () => {
    const doc = ['a', '  ~~~', '  keep', '  ~~~', 'b'].join('\n');
    expect(mapUnfenced(doc, upper)).toBe(['A', '  ~~~', '  keep', '  ~~~', 'B'].join('\n'));
  });

  it('closes only on the same character, at least as long, with no info string', () => {
    const doc = ['````md', '```', '~~~~', '```` not a close', '````', 'after'].join('\n');
    expect(mapUnfenced(doc, upper)).toBe(
      ['````md', '```', '~~~~', '```` not a close', '````', 'AFTER'].join('\n'),
    );
  });

  it('treats an unclosed fence as running to the end', () => {
    expect(mapUnfenced(['a', '```', 'b'].join('\n'), upper)).toBe(['A', '```', 'b'].join('\n'));
  });

  it('hands each opening fence line to onFenceOpen, and nothing else', () => {
    const seen: string[] = [];
    const out = mapUnfenced(['```tsx live', 'x', '```'].join('\n'), upper, (line) => {
      seen.push(line);
      return '```tsx';
    });
    expect(seen).toEqual(['```tsx live']);
    expect(out).toBe(['```tsx', 'x', '```'].join('\n'));
  });

  it('does not call fn for a document that is all fence', () => {
    let calls = 0;
    mapUnfenced(['```', 'x', '```'].join('\n'), (chunk) => {
      calls += 1;
      return chunk;
    });
    expect(calls).toBe(0);
  });
});
