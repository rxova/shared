import { writeFileSync } from 'node:fs';
import type { Writer } from '../../tooling/src/page-bundle.types.ts';

export const writeFile: Writer = (file, contents) => {
  writeFileSync(file, contents);
};
