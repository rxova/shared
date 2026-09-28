/** One byte as two lowercase hex digits. */
export const toHex = (byte: number): string => byte.toString(16).padStart(2, "0");
