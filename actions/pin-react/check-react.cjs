// Fails unless `react` and `react-dom` resolve to REACT_VERSION from the current
// directory and from every dependency of it that declares a `react` peer — the
// place a second copy hides: a package declared at the root (such as
// @rxova/ts-utils) resolves its peer from its own location, not the suite's.
'use strict';

const { createRequire } = require('node:module');
const { readFileSync, realpathSync } = require('node:fs');
const path = require('node:path');

const want = process.env.REACT_VERSION;
const here = process.cwd();
const fromHere = createRequire(path.join(here, 'package.json'));
const manifest = JSON.parse(readFileSync(path.join(here, 'package.json'), 'utf8'));

const versionFrom = (req, name) => {
  try {
    return req(`${name}/package.json`).version;
  } catch {
    return 'missing';
  }
};

const sites = [['.', fromHere]];
const deps = { ...manifest.dependencies, ...manifest.devDependencies };
for (const name of Object.keys(deps).sort()) {
  if (name === 'react' || name === 'react-dom') continue;
  let depManifest;
  try {
    depManifest = realpathSync(fromHere.resolve(`${name}/package.json`));
  } catch {
    continue; // no `./package.json` export or not installed: nothing to check
  }
  const peers = JSON.parse(readFileSync(depManifest, 'utf8')).peerDependencies ?? {};
  if ('react' in peers) sites.push([name, createRequire(depManifest)]);
}

let failed = false;
for (const [site, req] of sites) {
  // react-dom only where the site can see it: a package peering on react alone
  // may legitimately have no react-dom next to it.
  const names = site === '.' ? ['react', 'react-dom'] : ['react'];
  const got = names.map((name) => [name, versionFrom(req, name)]);
  const wrong = got.filter(([, version]) => version !== want);
  const label =
    site === '.'
      ? path.relative(process.env.GITHUB_WORKSPACE ?? here, here) || '.'
      : `${site} (peer)`;
  console.log(
    `${wrong.length > 0 ? 'x' : 'ok'} ${label}: ${got.map(([n, v]) => `${n}@${v}`).join(' ')}`,
  );
  if (wrong.length > 0) failed = true;
}
process.exit(failed ? 1 : 0);
