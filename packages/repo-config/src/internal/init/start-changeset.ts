import type { Repository } from "@/init/init.types";
import { changesetBody } from "@/internal/changeset/changeset-body";

/**
 * The changeset a private repository starts with: a minor bump of the package
 * init renamed, in `.changeset/<repository>-start.md`, so the changeset gate
 * passes on the first pull request.
 */
export const startChangeset = (
  packageName: string,
  target: Repository,
  template: Repository,
): { file: string; body: string } => ({
  file: `.changeset/${target.name}-start.md`,
  body: changesetBody(
    packageName,
    "minor",
    `Start ${target.name} from ${template.owner}/${template.name}.`,
  ),
});
