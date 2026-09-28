import { runBinChecks } from '@/internal/pack-smoke/bin-checks';
import { captureCommand } from '@/internal/pack-smoke/capture-command';
import { captureOutput } from '@/internal/pack-smoke/capture-output';
import { cssImportProblems } from '@/internal/pack-smoke/css-import-problems';
import { runFixtures } from '@/internal/pack-smoke/fixture-runs';
import { forbiddenFiles } from '@/internal/pack-smoke/forbidden-files';
import { lostClientDirectives } from '@/internal/pack-smoke/lost-client-directives';
import { missingFiles } from '@/internal/pack-smoke/missing-files';
import { missingTargets } from '@/internal/pack-smoke/missing-targets';
import { probeSource } from '@/internal/pack-smoke/probe-source';
import { probeTargets } from '@/internal/pack-smoke/probe-targets';
import { resolveWorkspaceDeps } from '@/internal/pack-smoke/resolve-workspace-deps';
import { scratchFiles } from '@/internal/pack-smoke/scratch-files';
import { tarballContents } from '@/internal/pack-smoke/tarball-contents';
import type { PackageManifest } from '@/manifest/manifest.types';
import type { ScratchFiles, Shell } from '@/pack-smoke/pack-smoke.types';
import { join } from 'node:path';
import { binsOf } from '@/pack-smoke/bins-of';
import { shippedFiles } from '@/pack-smoke/shipped-files';
import { parsePackageConfig } from '@/config/parse-package-config';

/**
 * Packs the real tarball, installs it into a scratch project, loads it the way
 * a consumer's Node would — once through `import`, once through `require` — and
 * runs every bin it declares.
 *
 * This is the only check that catches a `files` entry that dropped dist, an
 * exports map that resolves for a bundler but not for plain Node, or a bin that
 * lost its execute bit somewhere between the build and npm. Every one of those
 * ships green through lint, types and unit tests. It also reads the tarball
 * itself:
 *
 * - every `files` entry — a nested path or a glob too — and the README and
 *   license match something in it, and so does every file the manifest points
 *   at (`exports`, `main`, `types`, bins), `.d.cts` and `.cjs` included;
 * - it ships no sources, tests or end-to-end suites (`src/`, `e2e/`,
 *   `__tests__`, `*.test.*`, `*.spec.*`) unless a `files` entry names them;
 * - a built entry whose source opens with `'use client'` still does;
 * - every relative `@import` in an exported stylesheet resolves inside it.
 *
 * The package's own `package.json#repoConfig.packSmoke` adjusts the rest:
 * `load: "never"` skips the import probe (a package that ships TypeScript or
 * Astro sources), `bins` replaces a bin's `--version` check with `{ args,
 * expect }` (or `false` runs none), and `run` runs a bin against a fixture in
 * the scratch project and checks what it wrote. A package whose exports map
 * lists subpaths only is probed through each JavaScript subpath.
 *
 * `workspace:` dependencies and peers are packed too and resolved the way
 * `pnpm publish` would. It packs with `--ignore-scripts`, so dist has to be
 * built first. Returns the line to print; throws on any step that did not
 * behave the way a published package has to. The scratch directory is removed
 * either way.
 */
export const packSmoke = ({
  pkgDir,
  sh = captureCommand,
  output = captureOutput,
  fs = scratchFiles,
}: {
  pkgDir: string;
  sh?: Shell;
  /** Runs a configured bin check or fixture run; returns stdout and stderr together. */
  output?: Shell;
  fs?: ScratchFiles;
}): string => {
  const manifest = JSON.parse(fs.read(join(pkgDir, 'package.json'))) as PackageManifest;
  const name = manifest.name ?? '';
  const { packSmoke: config = {} } = parsePackageConfig(manifest.repoConfig);
  const scratch = fs.make();
  try {
    sh('npm', ['pack', '--ignore-scripts', '--pack-destination', scratch], pkgDir);
    const tarball = fs.list(scratch).find((file) => file.endsWith('.tgz'));
    if (tarball === undefined) throw new Error('npm pack produced no tarball');
    const peers = resolveWorkspaceDeps(pkgDir, manifest, join(scratch, tarball), scratch, {
      sh,
      fs,
    });

    // What is in the tarball, before anything is installed from it.
    const contents = tarballContents(join(scratch, tarball), sh, scratch);
    const missing = [
      ...new Set([
        ...missingFiles(shippedFiles(manifest), contents),
        ...missingTargets(manifest, contents),
      ]),
    ];
    if (missing.length > 0) throw new Error(`the tarball does not contain ${missing.join(', ')}`);
    const leaked = forbiddenFiles(contents, manifest.files ?? []);
    if (leaked.length > 0) {
      throw new Error(
        `the tarball ships sources or tests: ${leaked.join(', ')} — list them in package.json#files to publish them on purpose`,
      );
    }

    fs.write(join(scratch, 'package.json'), JSON.stringify({ name: 'scratch', private: true }));
    sh('npm', ['install', '--no-audit', '--no-fund', join(scratch, tarball), ...peers], scratch);

    // Every bin, as a consumer gets it, then the configured fixture runs.
    runBinChecks(binsOf(manifest), config.bins, { sh, output, scratch });
    runFixtures(config.run ?? [], { output, fs, scratch });

    // The library entry, through the exports map, in plain Node with no bundler.
    const installedDir = join(scratch, 'node_modules', name);
    const probed = config.load === 'never' ? [] : probeTargets(manifest);
    for (const target of probed) {
      const probe = join(scratch, 'probe.mjs');
      fs.write(probe, probeSource(target));
      const probeOut = sh('node', [probe], scratch).trim();
      if (probeOut !== 'ok') {
        throw new Error(`probe failed${target === name ? '' : ` for ${target}`}: ${probeOut}`);
      }
    }

    // A stylesheet a consumer imports must find what it imports.
    const dangling = cssImportProblems(manifest, contents, (path) =>
      fs.read(join(installedDir, path)),
    );
    if (dangling.length > 0) {
      throw new Error(`stylesheet imports do not resolve in the tarball: ${dangling.join(', ')}`);
    }

    // A client entry that lost its directive still imports; only a server
    // components build notices.
    const lost = lostClientDirectives(manifest, {
      pkgDir,
      installedDir,
      read: fs.read,
    });
    if (lost.length > 0) {
      throw new Error(`lost the 'use client' directive: ${lost.join(', ')}`);
    }

    const loaded = probed.length > 0 ? 'imports and requires' : 'is not loaded (nothing to probe)';
    return `pack:smoke ok — ${name}@${manifest.version ?? ''} installs, ${loaded} from a tarball`;
  } finally {
    fs.remove(scratch);
  }
};
