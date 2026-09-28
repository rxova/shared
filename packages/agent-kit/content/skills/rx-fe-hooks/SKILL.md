---
name: rx-fe-hooks
description: Writes and fixes React hooks the React 19 way, covering custom hooks, the rules of hooks, effects you do not need, dependencies and cleanup, stale closures, refs, useSyncExternalStore, transitions, useActionState, useOptimistic and use, with renderHook tests. Use when writing a custom hook, when an effect loops, fires twice or reads old values, or when moving form and async code to React 19 APIs.
---

# rx-fe-hooks

Most hook bugs are effects that should not exist. Compute during render, handle events in
handlers, and keep effects for synchronising with something outside React.

## When to use

- Writing a custom hook or reviewing one.
- An effect runs in a loop, runs twice in development, or reads a stale value.
- Subscribing to a browser API or a non-React store.
- Replacing hand-rolled pending and optimistic state in forms with React 19 APIs.

## Steps

1. **Check the versions.** Read `react` in `package.json` (this skill targets 19.x; some
   APIs such as `useEffectEvent` arrived in 19.2) and whether the React Compiler is on
   (`babel-plugin-react-compiler`, or `reactCompiler` in the Next config). Make sure
   `eslint-plugin-react-hooks` is enabled; its errors are real bugs.
2. **Ask whether you need an effect at all.**

   | You wrote an effect to...           | Do this instead                                 |
   | ----------------------------------- | ----------------------------------------------- |
   | compute a value from props or state | compute it during render                        |
   | reset state when a prop changes     | pass a `key` to the component                   |
   | respond to a click or submit        | do it in the event handler                      |
   | fetch data                          | the data layer (TanStack Query, RTK Query, RSC) |
   | notify a parent of a change         | call the parent's callback in the handler       |

3. **When an effect is right, write it as a sync with cleanup.** Every subscription, timer,
   listener or request returns a cleanup. Strict Mode runs setup, cleanup, setup in
   development to prove the cleanup works; do not work around it with a "has run" ref.
4. **List every reactive value in the dependencies.** If the list makes the effect run too
   often, change the code, not the list: move objects and functions inside the effect,
   depend on primitives (`user.id`, not `user`), or read the latest value without reacting
   to it with `useEffectEvent` (19.2+) or a ref updated in a layout effect.
5. **Avoid stale closures.** Use functional updates (`setCount((c) => c + 1)`) in timers and
   callbacks; read "latest" values from a ref only inside effects and handlers, never during
   render.
6. **Refs** hold values that do not affect output (timer ids, DOM nodes, latest callback).
   In React 19 `ref` is a normal prop, so new components do not need `forwardRef`, and a
   ref callback may return a cleanup function.
7. **External stores** use `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`.
   `getSnapshot` must return the same reference while nothing changed, and `subscribe` must
   be stable (module level or memoised).
8. **Keep input responsive** with `useTransition` for state updates that trigger expensive
   renders, and `useDeferredValue` for a value that feeds a slow child.
9. **React 19 form and async APIs:**
   - `useActionState(action, initial)` returns `[state, formAction, isPending]` for a form
     action; `useFormStatus()` from `react-dom` reads the parent form's pending state.
   - `useOptimistic(state, update)` shows the expected result while an action runs and
     falls back when it finishes.
   - `use(promise)` reads a promise created outside render (by a server component, a loader
     or a cache) under Suspense; `use(Context)` may be called conditionally.
10. **Test with `renderHook`** (see Example) and run the `rx-verify` skill.

## Rules

- Call hooks at the top level of components and custom hooks only; never in conditions,
  loops or after an early return (`use` is the one exception).
- A custom hook is named `useX`, shares logic, not state: two callers get two copies.
- Return a tuple for two values, an object for more. Keep the API small and typed.
- Never create a promise inside render and pass it to `use`; it is new every render.
- Do not silence `react-hooks/exhaustive-deps`. If you must, one line with the reason.
- With the React Compiler on, do not add `useMemo`/`useCallback` just for identity; keep the
  ones that exist until profiling says otherwise (see `rx-fe-performance`).

## Example

```ts
// use-online.ts
import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

export function useOnline() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
```

```ts
// use-online.test.ts
import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useOnline } from "./use-online";

it("reports going offline", () => {
  const { result } = renderHook(() => useOnline());
  expect(result.current).toBe(true);
  act(() => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
  });
  expect(result.current).toBe(false);
});
```
