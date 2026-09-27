/** The probe a consumer's Node would run, with no bundler in the way: one `import`, one `require`. */
export const probeSource = (name: string): string =>
  [
    "import { createRequire } from 'node:module';",
    `const esm = await import(${JSON.stringify(name)});`,
    `const cjs = createRequire(import.meta.url)(${JSON.stringify(name)});`,
    'if (Object.keys(esm).length === 0) throw new Error("the import entry exports nothing");',
    'if (Object.keys(cjs).length === 0) throw new Error("the require entry exports nothing");',
    "console.log('ok');",
  ].join('\n');
