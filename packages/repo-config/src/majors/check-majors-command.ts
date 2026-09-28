import { packageManifests } from "@/internal/packages/package-manifests";
import { readConfig } from "@/config/read-config";

/**
 * `rxova-repo-config check-majors`: the published packages share one major
 * version, so a consumer can read "core 3 works with react 3" off the
 * versions. Every package under `packages/` that is not private, or only
 * those `repoConfig.majors.packages` names. Returns the process exit code.
 */
export const checkMajorsCommand = ({ root = process.cwd() }: { root?: string } = {}): number => {
  try {
    const wanted = readConfig(root).majors?.packages;
    const packages = packageManifests(root, { published: true })
      .map(({ dir, manifest }) => ({ name: manifest.name ?? dir, version: manifest.version ?? "" }))
      .filter(({ name }) => wanted === undefined || wanted.includes(name));
    const unknown = (wanted ?? []).filter((name) => !packages.some((pkg) => pkg.name === name));
    if (unknown.length > 0) {
      throw new Error(
        `repoConfig.majors.packages names ${unknown.join(", ")}, which is not published here`,
      );
    }
    const majors = packages.map(({ name, version }) => {
      const major = /^(\d+)\./.exec(version)?.[1];
      if (major === undefined) throw new Error(`${name} has no semver version ("${version}")`);
      return major;
    });
    if (new Set(majors).size > 1) {
      console.error(
        [
          "check-majors: the published packages must share one major version.",
          ...packages.map(({ name, version }) => `  ${name}@${version}`),
        ].join("\n"),
      );
      return 1;
    }
    console.log(
      `check-majors: ${String(packages.length)} package(s) on major ${majors[0] ?? "none"}`,
    );
    return 0;
  } catch (failure) {
    console.error(`check-majors failed — ${(failure as Error).message}`);
    return 1;
  }
};
