import { writeFileSync } from 'node:fs';
import type { Writer } from '@rxova-tooling/page-bundle/page-bundle.types';

export const writeFile: Writer = (file, contents) => {
  writeFileSync(file, contents);
};
