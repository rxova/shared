import { describe, expect, it } from 'vitest';
import { PAGE_BUNDLE_FILENAME } from '@rxova-helpers/page-bundle/page-bundle-filename';

describe('PAGE_BUNDLE_FILENAME', () => {
  it('is the marker the aggregator looks for', () => {
    expect(PAGE_BUNDLE_FILENAME).toBe('rxova-page-bundle.json');
  });
});
