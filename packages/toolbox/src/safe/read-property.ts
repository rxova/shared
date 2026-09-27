import { tryRead } from '@/safe/try-read';

/** Reads a property, treating an inaccessible one as absent. */
export const readProperty = (value: object, key: PropertyKey): unknown => tryRead(value, key).value;
