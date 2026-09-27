import { describe, expect, it } from 'vitest';
import { isReleaseMetadata } from './is-release-metadata.js';

describe('isReleaseMetadata', () => {
  it.each(['.changeset/tidy-pandas-smile.md', 'CHANGELOG.md', 'packages/example/CHANGELOG.md'])(
    'treats %s as release bookkeeping',
    (file) => {
      expect(isReleaseMetadata(file)).toBe(true);
    },
  );

  it.each(['.changeset/config.json', 'README.md', 'packages/example/src/index.ts'])(
    'does not treat %s as release bookkeeping',
    (file) => {
      expect(isReleaseMetadata(file)).toBe(false);
    },
  );
});
