import { describe, expect, it } from 'vitest';
import { parseLlmsConfig } from '@/internal/config/parse-llms-config';

describe('parseLlmsConfig', () => {
  it('reads every root key', () => {
    const config = {
      api: 'documented',
      requiredTerms: ['overlock check'],
      idPattern: '\\b[A-Z][A-Z_]{6,}\\b',
      idsFrom: 'packages/overlock/src/types.ts#RULE_IDS',
      entries: 'subpaths',
      sections: ['Install|Use', 'Docs'],
      rootIndex: false,
    };
    expect(parseLlmsConfig(config, 'repoConfig.llms')).toEqual(config);
    expect(parseLlmsConfig({}, 'repoConfig.llms')).toEqual({});
  });

  it('keeps the repository-wide keys out of a package manifest', () => {
    expect(parseLlmsConfig({ api: 'none' }, 'p', { packageLevel: true })).toEqual({ api: 'none' });
    expect(() => parseLlmsConfig({ entries: 'index' }, 'p', { packageLevel: true })).toThrow(
      'unknown key "entries"',
    );
  });

  it.each([
    [{ api: 'all' }, 'p.api must be one of'],
    [{ idsFrom: 'types.ts' }, 'p.idsFrom must be a "path/to/file.ts#EXPORT_NAME" reference'],
    [{ idPattern: '(' }, 'p.idPattern must be a valid regular expression'],
    [{ rootIndex: 'yes' }, 'p.rootIndex must be a boolean'],
  ])('refuses %j', (value, message) => {
    expect(() => parseLlmsConfig(value, 'p')).toThrow(message);
  });
});
