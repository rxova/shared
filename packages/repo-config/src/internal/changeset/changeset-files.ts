/** The changeset entries among `changed`: the markdown files under `.changeset/`, README aside. */
export const changesetFiles = (changed: string[]): string[] =>
  changed.filter(
    (file) => file.startsWith(".changeset/") && file.endsWith(".md") && !file.endsWith("README.md"),
  );
