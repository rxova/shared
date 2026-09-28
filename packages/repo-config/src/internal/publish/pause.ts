/** Blocks the thread for `milliseconds`: the smoke test is a script with nothing else to do meanwhile. */
export const pause = (milliseconds: number): void => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
};
