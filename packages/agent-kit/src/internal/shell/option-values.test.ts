import { describe, expect, it } from 'vitest';
import { optionValues } from '@/internal/shell/option-values';

describe('optionValues', () => {
  it('reads --name value, --name=value and -Xvalue', () => {
    expect(
      optionValues(
        ['-F', 'a', '--body-file=b', '-Fc', '--other', 'd', '--body-file'],
        ['-F', '--body-file'],
      ),
    ).toEqual(['a', 'b', 'c', '']);
  });

  it('does not glue a value to a long option', () => {
    expect(optionValues(['--filex'], ['--file'])).toEqual([]);
  });
});
