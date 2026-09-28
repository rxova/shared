/** A source path's HTML route: `/rules/x.md` is `/rules/x/`, `/index.md` is `/`. */
export const routeFor = (path: string): string => {
  const id = path.replace(/\.md$/, "");
  return id === "/index" ? "/" : `${id}/`;
};
