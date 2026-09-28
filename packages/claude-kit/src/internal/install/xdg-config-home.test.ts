import { describe, expect, it } from 'vitest';
import { xdgConfigHome } from '@/internal/install/xdg-config-home';

describe('xdgConfigHome', () => {
  it('uses XDG_CONFIG_HOME when set, and ~/.config when it is unset or empty', () => {
    expect(xdgConfigHome('/x/config', '/home/me')).toBe('/x/config');
    expect(xdgConfigHome(undefined, '/home/me')).toBe('/home/me/.config');
    expect(xdgConfigHome('', '/home/me')).toBe('/home/me/.config');
  });
});
