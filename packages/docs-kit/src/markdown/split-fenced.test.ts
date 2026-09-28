import { describe, expect, it } from 'vitest';
import { splitFenced } from '@/markdown/split-fenced';

describe('splitFenced', () => {
  it('separates prose from fences and collects the openers', () => {
    const doc = ['intro', '```ts title="x"', '<Tabs>', '```', 'outro', '~~~', 'y', '~~~'].join(
      '\n',
    );
    expect(splitFenced(doc)).toEqual({
      unfenced: 'intro\noutro',
      openers: ['```ts title="x"', '~~~'],
    });
  });
});
