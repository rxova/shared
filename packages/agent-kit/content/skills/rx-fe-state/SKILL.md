---
name: rx-fe-state
description: Decides where each piece of React state lives (local, lifted, the URL, a server cache such as TanStack Query or RTK Query, a global client store such as Redux Toolkit or Zustand, context or a form library) with a decision table, derives what can be derived and keeps server data out of global stores. Use when adding state to a feature, when data goes stale or out of sync between screens, or when a global store keeps growing.
---

# rx-fe-state

Most state bugs are the same value stored twice. Give each value one home, pick the home by
who reads it and where it comes from, and compute everything else.

## When to use

- A new feature needs state and it is not obvious where to put it.
- Two screens show different values for the same thing, or data is stale after a save.
- The global store holds API responses, loading flags and form drafts.
- Choosing between context, Redux Toolkit, Zustand or a server cache.

## Steps

1. **Detect what the repository already uses.** Check `package.json` for
   `@tanstack/react-query`, `@reduxjs/toolkit`, `zustand`, `jotai`, `react-hook-form`,
   `nuqs`, the router, and whether it is a Next.js App Router app with server components.
   Use those; do not add a second library for the same job.
2. **Classify each value** with the table, top row first:

   | The value is...                                                          | Home                                              |
   | ------------------------------------------------------------------------ | ------------------------------------------------- |
   | computable from other state or props                                     | nowhere: derive it during render                  |
   | owned by the server (lists, records, the user)                           | server cache: RSC, TanStack Query or RTK Query    |
   | something a user would bookmark or share (filters, tab, page, search)    | the URL search params                             |
   | used by one component                                                    | `useState` / `useReducer` in it                   |
   | used by a few nearby components                                          | lifted to their closest common parent             |
   | form input until submit                                                  | the form (`react-hook-form`, or `useActionState`) |
   | rarely changing app-wide value (theme, locale, auth user, feature flags) | context                                           |
   | client-only, changed from many places, read by many                      | a store: Redux Toolkit or Zustand                 |

3. **Server data in a server cache only.** Read it with the query hook where it is needed;
   invalidate after writes instead of patching copies. Never copy a response into
   `useState`, context or a slice; that copy is what goes stale.
4. **URL state** through the router's search-param API or `nuqs`, parsed and validated
   (zod) at the edge; the component reads the parsed value, not the raw string.
5. **Local first, lift when needed.** Start in the component; lift only when a sibling needs
   it. Prefer passing `children` over drilling five levels, then context.
6. **Context for low-frequency values.** Every consumer re-renders when the value changes.
   Split contexts by change rate, and memoise the provider value unless the React Compiler
   is on.
7. **A store for shared client state.** Redux Toolkit when the repo uses it or when you need
   devtools, middleware and many contributors (see `rx-fe-redux-toolkit`); Zustand for a
   small store. Read with selectors that return the smallest slice.
8. **Derive, do not sync.** No `useEffect` that sets state from other state (see
   `rx-fe-hooks`). Totals, filtered lists, "is valid", "has changes" are computations.
9. **Reset with `key`.** When a form must start fresh for a different record, render it with
   `key={record.id}` instead of an effect that clears fields.
10. **Verify** with tests that cover the stale case (save, then check the other screen) and
    the `rx-verify` skill.

## Rules

- One source of truth per value. If you store an id, do not also store the object.
- No loading or error flags in a global store for requests; the server cache owns them.
- Keep state serialisable and minimal; store the selected id, not the selected item.
- Do not put a value in context "for convenience" if it changes on every keystroke.
- Zustand: select narrowly (`useStore((s) => s.count)`). A selector that returns a new object
  or array needs `useShallow` in v5, or it re-renders in a loop; check the installed major.

## Example

A product list with a category filter, a "compare" tray and an edit dialog:

- Products come from `useQuery({ queryKey: ['products', category] })`; saving invalidates
  `['products']`.
- `category` and `page` live in the URL (`?category=shoes&page=2`), so the view survives a
  reload and can be shared.
- The compare tray is used by the list, the header badge and the compare page: a small
  Zustand store holding product ids only; names and prices are looked up from the cache.
- The edit dialog uses `react-hook-form` with `defaultValues` from the product and
  `key={product.id}`.
- "3 items to compare" and the filtered count are derived in render.
