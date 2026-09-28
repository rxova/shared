import { describe, expect, it } from 'vitest';
import { isOwnHook } from '@/internal/install/is-own-hook';

describe('isOwnHook', () => {
  it('knows the runner on any platform, quoted or not', () => {
    expect(isOwnHook('node "/home/a/.claude/rx-ai/hooks.js" no-bypass')).toBe(true);
    expect(isOwnHook('node C:\\Users\\a\\.claude\\rx-ai\\hooks.js config-lock')).toBe(true);
    expect(isOwnHook('node /x/rx-ai/hooks.js')).toBe(true);
  });

  it('passes other commands and values', () => {
    expect(isOwnHook('node /x/rx-ai/hooks.json')).toBe(false);
    expect(isOwnHook('node /x/other/hooks.js')).toBe(false);
    expect(isOwnHook(undefined)).toBe(false);
  });
});
