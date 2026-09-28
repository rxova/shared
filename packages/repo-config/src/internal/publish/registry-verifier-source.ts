import type { PublishedPackage } from "@/internal/publish/published-package.types";

/**
 * The script the scratch project runs: every published package is installed
 * at exactly the reported version, and each `importable` one loads through
 * both `import` and `require` with something exported.
 */
export const registryVerifierSource = (
  published: readonly PublishedPackage[],
  importable: readonly PublishedPackage[],
): string =>
  [
    "import { createRequire } from 'node:module';",
    "import { readFileSync } from 'node:fs';",
    "import { resolve } from 'node:path';",
    "const require = createRequire(import.meta.url);",
    `for (const item of ${JSON.stringify(published)}) {`,
    "  const manifest = JSON.parse(readFileSync(resolve('node_modules', ...item.name.split('/'), 'package.json'), 'utf8'));",
    "  if (manifest.version !== item.version) {",
    "    throw new Error(item.name + ': expected ' + item.version + ', installed ' + manifest.version);",
    "  }",
    "  console.log('  ok ' + item.name + '@' + item.version + ' installed');",
    "}",
    `for (const item of ${JSON.stringify(importable)}) {`,
    "  const esm = await import(item.name);",
    "  const cjs = require(item.name);",
    "  if (Object.keys(esm).length === 0 || Object.keys(cjs).length === 0) {",
    "    throw new Error(item.name + ' exposes no exports');",
    "  }",
    "  console.log('  ok ' + item.name + ' loads through import and require');",
    "}",
  ].join("\n");
