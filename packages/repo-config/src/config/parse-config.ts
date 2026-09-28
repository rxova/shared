import { assertOnlyKeys } from '@/internal/config/assert-only-keys';
import { compact } from '@/internal/config/compact';
import { failConfig } from '@/internal/config/fail-config';
import { isRecord } from '@/internal/config/is-record';
import { parseBanned } from '@/internal/config/parse-banned';
import { parseLlmsConfig } from '@/internal/config/parse-llms-config';
import { parseSteps } from '@/internal/config/parse-steps';
import { readBoolean } from '@/internal/config/read-boolean';
import { readCount } from '@/internal/config/read-count';
import { readEnum } from '@/internal/config/read-enum';
import { readPattern } from '@/internal/config/read-pattern';
import { readSection } from '@/internal/config/read-section';
import { readString } from '@/internal/config/read-string';
import { readStringRecord } from '@/internal/config/read-string-record';
import { readStrings } from '@/internal/config/read-strings';
import type { RepoConfig } from '@/config/config.types';

type Section<Key extends keyof RepoConfig> = NonNullable<RepoConfig[Key]>;

/**
 * Checks the raw `repoConfig` value of a root `package.json` and returns it typed.
 *
 * Validated rather than trusted: a typo would otherwise silently fall back to
 * a default, which is the kind of quiet drift the shared scripts exist to end.
 * Every section and every key is optional; an unknown one is an error.
 */
export const parseConfig = (raw: unknown): RepoConfig => {
  if (raw === undefined) return {};
  if (!isRecord(raw)) return failConfig('repoConfig', 'an object');
  assertOnlyKeys(raw, 'repoConfig', [
    'verify',
    'changeset',
    'majors',
    'tsdoc',
    'docs',
    'snippets',
    'packages',
    'postPublish',
    'llms',
    'testScripts',
    'fileSize',
  ]);
  const at = 'repoConfig';

  const verify = readSection(raw, 'verify', at, ['steps']);
  const changeset = readSection(raw, 'changeset', at, [
    'singlePackage',
    'scope',
    'roots',
    'aliasPrefix',
    'includePrivate',
    'syncRootVersionFrom',
  ]);
  const majors = readSection(raw, 'majors', at, ['packages']);
  const tsdoc = readSection(raw, 'tsdoc', at, ['entries', 'exclude']);
  const docs = readSection(raw, 'docs', at, ['root', 'banned', 'allow', 'exclude', 'readmes']);
  const snippets = readSection(raw, 'snippets', at, ['include', 'skipInfo']);
  const packages = readSection(raw, 'packages', at, ['marker']);
  const postPublish = readSection(raw, 'postPublish', at, ['importPattern', 'peers']);
  const llms = readSection(raw, 'llms', at, [
    'api',
    'requiredTerms',
    'idPattern',
    'idsFrom',
    'entries',
    'sections',
    'rootIndex',
  ]);
  const testScripts = readSection(raw, 'testScripts', at, ['globs']);
  const fileSize = readSection(raw, 'fileSize', at, ['max', 'extensions', 'ignore', 'allow']);

  return compact<RepoConfig>({
    verify:
      verify &&
      compact<Section<'verify'>>({
        steps: verify.steps === undefined ? undefined : parseSteps(verify.steps),
      }),
    changeset:
      changeset &&
      compact<Section<'changeset'>>({
        singlePackage: readBoolean(changeset, 'singlePackage', `${at}.changeset`),
        scope: readEnum(changeset, 'scope', `${at}.changeset`, ['code', 'shipped']),
        roots: readStrings(changeset, 'roots', `${at}.changeset`),
        aliasPrefix: readString(changeset, 'aliasPrefix', `${at}.changeset`),
        includePrivate: readBoolean(changeset, 'includePrivate', `${at}.changeset`),
        syncRootVersionFrom: readString(changeset, 'syncRootVersionFrom', `${at}.changeset`),
      }),
    majors:
      majors &&
      compact<Section<'majors'>>({ packages: readStrings(majors, 'packages', `${at}.majors`) }),
    tsdoc:
      tsdoc &&
      compact<Section<'tsdoc'>>({
        entries: readStringRecord(tsdoc, 'entries', `${at}.tsdoc`),
        exclude: readStrings(tsdoc, 'exclude', `${at}.tsdoc`),
      }),
    docs:
      docs &&
      compact<Section<'docs'>>({
        root: readString(docs, 'root', `${at}.docs`),
        banned:
          docs.banned === undefined ? undefined : parseBanned(docs.banned, `${at}.docs.banned`),
        allow: readStrings(docs, 'allow', `${at}.docs`),
        exclude: readStrings(docs, 'exclude', `${at}.docs`),
        readmes: readBoolean(docs, 'readmes', `${at}.docs`),
      }),
    snippets:
      snippets &&
      compact<Section<'snippets'>>({
        include: readStrings(snippets, 'include', `${at}.snippets`),
        skipInfo: readStrings(snippets, 'skipInfo', `${at}.snippets`),
      }),
    packages:
      packages &&
      compact<Section<'packages'>>({ marker: readString(packages, 'marker', `${at}.packages`) }),
    postPublish:
      postPublish &&
      compact<Section<'postPublish'>>({
        importPattern: readPattern(postPublish, 'importPattern', `${at}.postPublish`),
        peers: readStringRecord(postPublish, 'peers', `${at}.postPublish`),
      }),
    llms: llms && parseLlmsConfig(llms, `${at}.llms`),
    testScripts:
      testScripts &&
      compact<Section<'testScripts'>>({
        globs: readStrings(testScripts, 'globs', `${at}.testScripts`),
      }),
    fileSize:
      fileSize &&
      compact<Section<'fileSize'>>({
        max: readCount(fileSize, 'max', `${at}.fileSize`),
        extensions: readStrings(fileSize, 'extensions', `${at}.fileSize`),
        ignore: readStrings(fileSize, 'ignore', `${at}.fileSize`),
        allow: readStrings(fileSize, 'allow', `${at}.fileSize`),
      }),
  });
};
