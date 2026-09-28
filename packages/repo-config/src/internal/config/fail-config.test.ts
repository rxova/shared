import { describe, expect, it } from 'vitest';
import { failConfig } from '@/internal/config/fail-config';

describe('failConfig', () => {
  it('names the field and what it should have been', () => {
    expect(() => failConfig('repoConfig.verify', 'an object')).toThrow(
      'package.json#repoConfig.verify must be an object',
    );
  });
});
