import { describe, expect, it } from 'vitest';
import { selectItems } from '@/install/select-items';

const names = ['rx-planner', 'rx-pitch', 'rx-tdd', 'no-bypass', 'quick-check'];

describe('selectItems', () => {
  it('takes a profile’s items, in catalog order', () => {
    expect(selectItems({ names, profile: 'core', previous: undefined })).toEqual({
      profile: 'core',
      items: ['rx-planner', 'no-bypass'],
    });
    expect(selectItems({ names, profile: 'hackathon', previous: undefined }).items).not.toContain(
      'rx-tdd',
    );
    expect(selectItems({ names, profile: 'full', previous: undefined }).items).toEqual(names);
  });

  it('adds and skips on top of it', () => {
    expect(
      selectItems({
        names,
        profile: 'core',
        add: ['quick-check'],
        skip: ['no-bypass'],
        previous: undefined,
      }).items,
    ).toEqual(['rx-planner', 'quick-check']);
  });

  it('keeps the previous selection without a profile, dropping names that no longer exist', () => {
    const previous = { profile: 'full', items: ['rx-pitch', 'rx-gone'] };
    expect(selectItems({ names, profile: undefined, add: ['rx-tdd'], previous })).toEqual({
      profile: 'full',
      items: ['rx-pitch', 'rx-tdd'],
    });
  });

  it('starts from core on a first install', () => {
    expect(selectItems({ names, profile: undefined, previous: undefined }).profile).toBe('core');
  });

  it('rejects an unknown profile or name', () => {
    expect(() => selectItems({ names, profile: 'huge', previous: undefined })).toThrow(
      'core, hackathon, dotnet, full',
    );
    expect(() => selectItems({ names, profile: 'toString', previous: undefined })).toThrow(
      'unknown profile',
    );
    expect(() =>
      selectItems({ names, profile: undefined, skip: ['nope'], previous: undefined }),
    ).toThrow('nope');
  });
});
