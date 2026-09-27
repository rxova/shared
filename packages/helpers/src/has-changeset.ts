import { changesetFiles } from './changeset-files.ts';

export const hasChangeset = (changed: string[]): boolean => changesetFiles(changed).length > 0;
