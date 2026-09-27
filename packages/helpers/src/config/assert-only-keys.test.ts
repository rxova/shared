import { describe, expect, it } from 'vitest';
import { assertOnlyKeys } from '@rxova-helpers/config/assert-only-keys';

describe('assertOnlyKeys', () => {
  it('accepts the allowed keys, in any subset', () => {
    expect(() => {
      assertOnlyKeys({ verify: {} }, 'tooling', ['verify', 'changeset']);
      assertOnlyKeys({}, 'tooling', ['verify']);
    }).not.toThrow();
  });

  it('names an unknown key and the keys it could have been', () => {
    expect(() => {
      assertOnlyKeys({ verfy: {} }, 'tooling', ['verify', 'changeset']);
    }).toThrow(
      'package.json#tooling has an unknown key "verfy"; expected one of verify, changeset',
    );
  });
});
