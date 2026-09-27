import { readProperty } from './read-property.js';

/** Reads a string property, treating an inaccessible or differently typed one as absent. */
export const readString = (value: object, key: PropertyKey): string | undefined => {
  const property = readProperty(value, key);
  return typeof property === 'string' ? property : undefined;
};
