---
name: rx-fe-performance
description: Makes a React app faster by profiling first, then cutting needless re-renders with state colocation, split contexts and stable props, using memo only where measured and knowing what the React Compiler already does, virtualising long lists, fixing images and tracking LCP, INP and CLS in production. Use when a screen feels slow, typing lags, Core Web Vitals are poor, or someone proposes wrapping everything in useMemo.
---

# rx-fe-performance

Measure, change one thing, measure again. Most React slowness is too much rendering or too
much JavaScript, and the profiler tells you which in a minute.

## When to use

- Typing, scrolling or opening a menu feels laggy.
- Field data (Search Console, RUM) shows poor LCP, INP or CLS.
- A list of hundreds of rows renders slowly.
- A pull request adds `memo`, `useMemo` or `useCallback` everywhere "for performance".

## Steps

1. **Reproduce in a production build** on a throttled profile (DevTools: 4x CPU slowdown,
   Fast 4G). Development builds and Strict Mode double renders are not representative.
2. **Profile.**
   - React DevTools Profiler: record the slow interaction, turn on "Record why each component
     rendered", and read the flame graph for wide or repeated commits.
   - Chrome Performance panel: long tasks over 50 ms, layout thrash, the INP breakdown
     (input delay, processing, presentation).
   - `why-did-you-render` in development only, when you need to see which prop changed.
     Write down the number (commit time, INP in ms) before changing anything.
3. **Check whether the React Compiler is on** (`babel-plugin-react-compiler`, or
   `reactCompiler` in the Next config). It memoises components and values automatically,
   so identity-driven re-renders mostly disappear. It cannot fix state that sits too high,
   a context that changes on every keystroke, or a slow component that must render. If it is
   off and the project can adopt it, that is often the cheapest single change; follow
   react.dev/learn/react-compiler for the installed React version.
4. **Fix re-renders structurally before memoising:**
   - **Colocate state.** Move state down to the component that uses it, so typing in a
     search box does not re-render the page.
   - **Lift content up.** Pass expensive subtrees as `children`; a parent's state change
     does not re-render `children` it received.
   - **Split context** by change rate: one for rarely-changing values (user, theme), one for
     fast ones, or a store with selectors (`rx-fe-state`, `rx-fe-redux-toolkit`).
   - **Stable props.** Do not create objects, arrays or inline components inside render and
     pass them to memoised children. Never define a component inside another component.
5. **Memoise where the profiler points** (without the compiler): `memo` on the expensive
   child, `useMemo` for the costly computation or the object it receives, `useCallback` for
   the handler it receives. A memo whose props change every render only adds cost.
6. **Keep input responsive** with `useTransition` or `useDeferredValue` around the expensive
   update (see `rx-fe-hooks`), and move heavy pure work to a Web Worker.
7. **Virtualise long lists** over roughly 100 complex rows with `@tanstack/react-virtual` or
   `react-window`. Keep rows fixed height where possible, and use stable `key`s from data,
   never the index when rows can be reordered.
8. **Images and LCP.** Serve modern formats at the displayed size (`srcset`/`sizes`, or
   `next/image`), give every image `width` and `height`, mark the LCP image
   `fetchPriority="high"` and never lazy-load it; lazy-load the rest.
9. **Cut JavaScript.** Large bundles hurt LCP and INP; use the `rx-fe-code-splitting` skill.
10. **Measure in production** with the `web-vitals` package (`onLCP`, `onINP`, `onCLS`)
    sending to your analytics or RUM, and compare the 75th percentile before and after.
    Good thresholds: LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less.

## Rules

- No optimisation without a before and after number in the pull request.
- Do not wrap everything in `memo`/`useMemo`/`useCallback`; with the compiler on, do not add
  them for identity at all, and do not rip existing ones out without profiling.
- Reserve space for anything that loads late (images, ads, lazy components, fonts with
  `font-display` and size-adjusted fallbacks) to avoid CLS.
- Lighthouse is a lab check; field data decides whether users got faster.

## Example

Typing in the filter box of a 2,000-row orders table takes 180 ms per key. The profiler shows
the whole `OrdersPage` re-rendering because `filter` state lives there and every row
re-renders. Fix: move the input and its state into `OrdersFilter`, pass the deferred value
to the table with `useDeferredValue`, virtualise the rows with `@tanstack/react-virtual`,
and derive the filtered array with `useMemo` keyed on the deferred filter (or let the
compiler do it). Re-profile: 12 ms per key, and INP in the lab drops from 240 ms to 60 ms.
Record both numbers in the PR and verify with the `rx-verify` skill.
