import type { BinCheck } from '@/config/config.types';
import type { Shell } from '@/pack-smoke/pack-smoke.types';

/**
 * Runs every bin the package installs, from the scratch project. A bin with a
 * configured check runs with its `args` and must print its `expect` text (on
 * either stream, through `output`); any other bin runs `--version` and must
 * print a semver. `false` runs none. Throws on the first bin that misbehaves.
 */
export const runBinChecks = (
  bins: readonly string[],
  checks: false | Readonly<Record<string, BinCheck>> | undefined,
  { sh, output, scratch }: { sh: Shell; output: Shell; scratch: string },
): void => {
  if (checks === false) return;
  const unknown = Object.keys(checks ?? {}).filter((bin) => !bins.includes(bin));
  if (unknown.length > 0) {
    throw new Error(
      `repoConfig.packSmoke.bins names ${unknown.join(', ')}, which the package does not install`,
    );
  }
  for (const bin of bins) {
    const check = checks?.[bin];
    if (check === undefined) {
      const version = sh('npx', ['--no-install', bin, '--version'], scratch).trim();
      if (!/^\d+\.\d+\.\d+/.test(version)) {
        throw new Error(`bin \`${bin}\` reported an unusable version: ${version}`);
      }
      continue;
    }
    const printed = output('npx', ['--no-install', bin, ...check.args], scratch);
    const wanted = check.expect;
    if (wanted === undefined ? !/\d+\.\d+\.\d+/.test(printed) : !printed.includes(wanted)) {
      throw new Error(
        `bin \`${[bin, ...check.args].join(' ')}\` did not print ${wanted === undefined ? 'a version' : `"${wanted}"`}: ${printed.trim()}`,
      );
    }
  }
};
