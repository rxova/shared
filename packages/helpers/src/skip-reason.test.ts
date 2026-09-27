import { describe, expect, it } from 'vitest';
import { SKIP_LABEL } from './skip-label.ts';
import { skipReason } from './skip-reason.ts';

describe('skipReason', () => {
  it('reads the label', () => {
    expect(skipReason({ labels: ['dependencies', SKIP_LABEL] })).toContain('set on this pull');
  });

  it('reads the bracketed marker in the title, but not the bare word', () => {
    expect(skipReason({ title: `chore: bump [${SKIP_LABEL}]` })).toContain('title');
    expect(skipReason({ title: SKIP_LABEL })).toBeUndefined();
  });

  it('is nothing for a pull request that asks for no excuse', () => {
    expect(skipReason({})).toBeUndefined();
    expect(skipReason({ labels: ['dependencies'] })).toBeUndefined();
  });
});
