import { describe, expect, it } from 'vitest';
import { pageBundleManifest } from './page-bundle-manifest.js';

describe('pageBundleManifest', () => {
  it('builds the schema-2 page-component marker', () => {
    expect(pageBundleManifest('overlock', '/packages/overlock/')).toEqual({
      schema: 2,
      format: 'html-page-component',
      project: 'overlock',
      base: '/packages/overlock/',
    });
  });

  it.each(['Overlock', '-overlock', 'over_lock', ''])('rejects the project %j', (project) => {
    expect(() => pageBundleManifest(project, '/packages/x/')).toThrow('project');
  });

  it.each(['/', '/packages/x', 'packages/x/', '/Packages/x/', '/packages//'])(
    'rejects the base %j',
    (base) => {
      expect(() => pageBundleManifest('x', base)).toThrow('mount path');
    },
  );
});
