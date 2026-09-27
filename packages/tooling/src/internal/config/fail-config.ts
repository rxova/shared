/** Throws the one error shape every `tooling` config problem is reported in. */
export const failConfig = (path: string, expected: string): never => {
  throw new Error(`package.json#${path} must be ${expected}`);
};
