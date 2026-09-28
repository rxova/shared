import { captureCommand } from "@/internal/pack-smoke/capture-command";
import { scratchFiles } from "@/internal/pack-smoke/scratch-files";
import { installWithRetries } from "@/internal/publish/install-with-retries";
import { parsePublishedPackages } from "@/internal/publish/parse-published-packages";
import { pause } from "@/internal/publish/pause";
import { registryVerifierSource } from "@/internal/publish/registry-verifier-source";
import { waitForRegistry } from "@/internal/publish/wait-for-registry";
import type { ScratchFiles, Shell } from "@/pack-smoke/pack-smoke.types";
import { join } from "node:path";
import { readConfig } from "@/config/read-config";

/**
 * `rxova-repo-config post-publish-smoke`: after a release, installs what npm
 * now serves — not the workspace — into a scratch project and loads it.
 *
 * Reads `PUBLISHED_PACKAGES` (the `publishedPackages` output of
 * `changesets/action`), waits for the registry to list each exact version,
 * installs them with retries, checks the installed versions, and imports the
 * packages matching `repoConfig.postPublish.importPattern` (every one by
 * default) through `import` and `require`. `repoConfig.postPublish.peers` is
 * installed beside them. The tarball smoke before the release cannot catch a
 * publish that never reached the registry; this can. Returns the process exit code.
 */
export const postPublishSmokeCommand = ({
  env = process.env,
  root = process.cwd(),
  sh = captureCommand,
  fs = scratchFiles,
  sleep = pause,
  now = Date.now,
}: {
  env?: NodeJS.ProcessEnv;
  root?: string;
  sh?: Shell;
  fs?: ScratchFiles;
  sleep?: (milliseconds: number) => void;
  now?: () => number;
} = {}): number => {
  try {
    const packages = parsePublishedPackages(env.PUBLISHED_PACKAGES ?? "");
    const { importPattern, peers = {} } = readConfig(root).postPublish ?? {};
    console.log(`post-publish-smoke: checking ${String(packages.length)} package(s) from npm`);
    waitForRegistry(packages, {
      isPublished: ({ name, version }) => {
        try {
          return (
            sh("npm", ["view", `${name}@${version}`, "version", "--prefer-online"], root).trim() ===
            version
          );
        } catch {
          // A first-ever publish is a 404 until the registry catches up.
          return false;
        }
      },
      sleep,
      now,
    });
    const scratch = fs.make();
    try {
      const dependencies = Object.fromEntries(packages.map(({ name, version }) => [name, version]));
      fs.write(
        join(scratch, "package.json"),
        JSON.stringify({
          name: "post-publish-smoke",
          private: true,
          type: "module",
          dependencies: { ...peers, ...dependencies },
        }),
      );
      installWithRetries(
        () => void sh("npm", ["install", "--no-audit", "--no-fund", "--prefer-online"], scratch),
        { sleep },
      );
      const pattern = importPattern === undefined ? undefined : new RegExp(importPattern);
      const importable = packages.filter(({ name }) => pattern?.test(name) ?? true);
      fs.write(join(scratch, "verify.mjs"), registryVerifierSource(packages, importable));
      console.log(sh("node", ["verify.mjs"], scratch).trimEnd());
    } finally {
      fs.remove(scratch);
    }
    console.log("post-publish-smoke: ok");
    return 0;
  } catch (failure) {
    console.error(`post-publish-smoke failed — ${(failure as Error).message}`);
    return 1;
  }
};
