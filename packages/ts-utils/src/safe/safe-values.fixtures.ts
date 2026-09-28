/** A revoked proxy: every trap throws. */
export const hostile = (): object => {
  const { proxy, revoke } = Proxy.revocable({}, {});
  revoke();
  return proxy;
};

/** An object whose `value` getter throws. */
export const throwingGetter = Object.defineProperty({}, "value", {
  get() {
    throw new Error("getter");
  },
});
