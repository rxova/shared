// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@/react/render-hook.fixtures';
import { useDevWarner } from '@/react/use-dev-warner';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('useDevWarner', () => {
  it('sends detail and line to onWarn, once per key per instance', () => {
    const onWarn = vi.fn();
    const first = renderHook(
      () => useDevWarner<{ code: string }>({ prefix: 'pkg', enabled: () => true, onWarn }),
      undefined,
    );
    const second = renderHook(
      () => useDevWarner<{ code: string }>({ prefix: 'pkg', enabled: () => true, onWarn }),
      undefined,
    );

    first.result.current.warnOnce('k', 'careful', { code: 'PK1', detail: { code: 'PK1' } });
    first.result.current.warnOnce('k', 'careful', { code: 'PK1', detail: { code: 'PK1' } });
    second.result.current.warnOnce('k', 'careful');

    expect(onWarn).toHaveBeenNthCalledWith(1, { code: 'PK1' });
    expect(onWarn).toHaveBeenNthCalledWith(2, undefined);
    expect(onWarn).toHaveBeenCalledTimes(2);
  });

  it('is the same warner on every render, reading onWarn and enabled from the latest', () => {
    const early = vi.fn();
    const late = vi.fn();
    const { result, rerender } = renderHook(
      ({ onWarn, on }) => useDevWarner({ prefix: 'pkg', enabled: () => on, onWarn }),
      { onWarn: early, on: false },
    );
    const warner = result.current;
    warner.warn('hidden');
    rerender({ onWarn: late, on: true });
    expect(result.current).toBe(warner);
    warner.warn('shown');
    expect(early).not.toHaveBeenCalled();
    expect(late).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it('writes the line alone to console.warn in development without onWarn', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { result } = renderHook(
      () => useDevWarner({ prefix: 'pkg', docsUrl: 'https://example.com/e' }),
      undefined,
    );
    result.current.warn('careful', { code: 'PK2', detail: 1 });
    expect(warn).toHaveBeenCalledWith('[pkg] PK2: careful\n  → https://example.com/e#pk2');
    result.current.warn('plain');
    expect(warn).toHaveBeenLastCalledWith('[pkg] plain');
  });

  it('is silent in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { result } = renderHook(() => useDevWarner({ prefix: 'pkg' }), undefined);
    result.current.warn('careful');
    expect(warn).not.toHaveBeenCalled();
  });
});
