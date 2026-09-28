/**
 * `.` and `..` collapsed in a rooted path: `/learn/../rules/x.md` is
 * `/rules/x.md`. `..` past the root is clamped, as a browser resolves an
 * over-deep relative URL; the route check then reports the link as dangling
 * rather than letting it resolve to something plausible.
 */
export const normalizePath = (path: string): string => {
  const out: string[] = [];
  for (const segment of path.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") out.pop();
    else out.push(segment);
  }
  return `/${out.join("/")}`;
};
