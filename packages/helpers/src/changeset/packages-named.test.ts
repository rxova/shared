import { describe, expect, it } from 'vitest';
import { packagesNamed } from '@rxova-helpers/changeset/packages-named';

describe('packagesNamed', () => {
  it.each([
    ["---\n'@scope/a': patch\n---\n", 1],
    ['---\n"a": minor # why\n"b": major\n---', 2],
    ['---\n---\n', 0],
    ['no frontmatter', 0],
    ['---\r\n"a": patch\r\n---\r\n', 1],
    ['---\n"a": patch\n', 0],
    ['text\n---\n"a": patch\n---\n', 0],
  ])('counts %j as %d', (body, count) => {
    expect(packagesNamed(body)).toBe(count);
  });

  it('stays linear on an unterminated frontmatter of blank lines', () => {
    const body = `---\n${'\n '.repeat(200_000)}`;
    const start = performance.now();
    expect(packagesNamed(body)).toBe(0);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});
