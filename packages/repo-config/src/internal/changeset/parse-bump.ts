/** The bumps a changeset records. */
export type Bump = "patch" | "minor" | "major";

/** `value` as a changeset bump; throws naming the three when it is none of them. */
export const parseBump = (value: string | undefined): Bump => {
  const bumps: readonly Bump[] = ["patch", "minor", "major"];
  const bump = bumps.find((candidate) => candidate === value);
  if (bump === undefined) {
    throw new Error(`invalid bump "${value ?? ""}"; expected one of ${bumps.join(", ")}`);
  }
  return bump;
};
