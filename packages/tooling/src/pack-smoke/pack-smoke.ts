import { captureCommand } from '@rxova-helpers/pack-smoke/capture-command';
import { probeSource } from '@rxova-helpers/pack-smoke/probe-source';
import { resolveWorkspaceDeps } from '@rxova-helpers/pack-smoke/resolve-workspace-deps';
import { scratchFiles } from '@rxova-helpers/pack-smoke/scratch-files';
import type { PackageManifest } from '@/manifest/manifest.types';
import type { ScratchFiles, Shell } from '@/pack-smoke/pack-smoke.types';
import { join } from 'node:path';
import { binsOf } from '@/pack-smoke/bins-of';
import { shippedFiles } from '@/pack-smoke/shipped-files';

/**
 * Packs the real tarball, installs it into a scratch project, loads it the way
 * a consumer's Node would — once through `import`, once through `require` — and
 * runs every bin it declares.
 *
 * This is the only check that catches a `files` entry that dropped dist, an
 * exports map that resolves for a bundler but not for plain Node, or a bin that
 * lost its execute bit somewhere between the build and npm. Every one of those
 * ships green through lint, types and unit tests. It also checks the files a
 * reader opens in `node_modules` beside dist: the README, the license, and
 * whatever else `files` lists.
 *
 * It packs with `--ignore-scripts`, so dist has to be built first. Returns the
 * line to print; throws on any step that did not behave the way a published
 * package has to. The scratch directory is removed either way.
 */
export const packSmoke = ({
  pkgDir,
  sh = captureCommand,
  fs = scratchFiles,
}: {
  pkgDir: string;
  sh?: Shell;
  fs?: ScratchFiles;
}): string => {
  const manifest = JSON.parse(fs.read(join(pkgDir, 'package.json'))) as PackageManifest;
  const name = manifest.name ?? '';
  const scratch = fs.make();
  try {
    sh('npm', ['pack', '--ignore-scripts', '--pack-destination', scratch], pkgDir);
    const tarball = fs.list(scratch).find((file) => file.endsWith('.tgz'));
    if (tarball === undefined) throw new Error('npm pack produced no tarball');
    resolveWorkspaceDeps(pkgDir, manifest, join(scratch, tarball), scratch, { sh, fs });

    fs.write(join(scratch, 'package.json'), JSON.stringify({ name: 'scratch', private: true }));
    sh('npm', ['install', '--no-audit', '--no-fund', join(scratch, tarball)], scratch);

    const installed = fs.list(join(scratch, 'node_modules', name));
    const missing = shippedFiles(manifest).filter((file) => !installed.includes(file));
    if (missing.length > 0) throw new Error(`the tarball does not contain ${missing.join(', ')}`);

    // Every bin, as a consumer gets it.
    for (const bin of binsOf(manifest)) {
      const version = sh('npx', ['--no-install', bin, '--version'], scratch).trim();
      if (!/^\d+\.\d+\.\d+/.test(version)) {
        throw new Error(`bin \`${bin}\` reported an unusable version: ${version}`);
      }
    }

    // The library entry, through the exports map, in plain Node with no bundler.
    const probe = join(scratch, 'probe.mjs');
    fs.write(probe, probeSource(name));
    const probeOut = sh('node', [probe], scratch).trim();
    if (probeOut !== 'ok') throw new Error(`probe failed: ${probeOut}`);

    return `pack:smoke ok — ${name}@${manifest.version ?? ''} installs, imports and requires from a tarball`;
  } finally {
    fs.remove(scratch);
  }
};
