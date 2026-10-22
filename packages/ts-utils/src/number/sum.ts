/**
 * The numbers added up, left to right, from 0: an empty list sums to 0. A NaN
 * anywhere makes the total NaN, so a bad input shows rather than vanishing.
 */
export const sum = (values: Iterable<number>): number => {
  let total = 0;
  for (const value of values) total += value;
  return total;
};
