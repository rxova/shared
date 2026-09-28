import { changesetFiles } from "@/internal/changeset/changeset-files";

export const hasChangeset = (changed: string[]): boolean => changesetFiles(changed).length > 0;
