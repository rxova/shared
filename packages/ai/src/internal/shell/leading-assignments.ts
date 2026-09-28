/** How many of the words open the command as `NAME=value` environment assignments. */
export const leadingAssignments = (words: readonly string[]): number => {
  const program = words.findIndex((word) => !/^[A-Za-z_]\w*=/.test(word));
  return program === -1 ? words.length : program;
};
