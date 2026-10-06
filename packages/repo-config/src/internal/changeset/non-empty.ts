/** `value`, or undefined when it is missing or empty: a workflow passes an unset input as "". */
export const nonEmpty = (value: string | undefined): string | undefined =>
  value === "" ? undefined : value;
