---
name: rx-fe-redux-toolkit
description: Builds and maintains Redux state with Redux Toolkit 2.x, covering configureStore, createSlice, typed hooks, RTK Query with tags and optimistic updates, entity adapters, memoised selectors, listener middleware, tests with a real store and migrating legacy Redux. Use when a React app already uses Redux or genuinely needs shared client state that many screens change.
---

# rx-fe-redux-toolkit

Redux Toolkit is the only supported way to write Redux. Keep server data in RTK Query, keep
the store for client state that many screens share, and let selectors derive everything else.

## When to use

- The repository already has `@reduxjs/toolkit` or `redux` in `package.json`.
- Adding a slice, an RTK Query endpoint, a listener or a selector.
- Migrating hand-written reducers, `connect()` or `redux-thunk` boilerplate to RTK.

Do not reach for Redux when the state is local to one component, lives in the URL, or is
server data another cache already holds (TanStack Query). The `rx-fe-state` skill decides
where state belongs; come here once the answer is "a global store".

## Steps

1. **Detect the version and layout.** Check `@reduxjs/toolkit` and `react-redux` in
   `package.json` (this skill assumes RTK 2.x and react-redux 9.x) and find the existing
   `store.ts`, slices and API definitions. Follow their folder layout (by feature is usual).
2. **One store, created by a function** so tests get a fresh one:

   ```ts
   // app/store.ts
   import { combineSlices, configureStore } from '@reduxjs/toolkit';
   import { setupListeners } from '@reduxjs/toolkit/query';
   import { api } from '@/app/api';
   import { cartSlice } from '@/features/cart/cart-slice';
   import { listener } from '@/app/listener';

   const rootReducer = combineSlices(cartSlice, api);
   export type RootState = ReturnType<typeof rootReducer>;

   export const makeStore = (preloadedState?: Partial<RootState>) => {
     const store = configureStore({
       reducer: rootReducer,
       preloadedState,
       middleware: (gDM) => gDM().prepend(listener.middleware).concat(api.middleware),
     });
     setupListeners(store.dispatch); // refetchOnFocus / refetchOnReconnect
     return store;
   };
   export type AppStore = ReturnType<typeof makeStore>;
   export type AppDispatch = AppStore['dispatch'];
   ```

3. **Typed hooks, once:** `export const useAppSelector = useSelector.withTypes<RootState>()`
   and `useAppDispatch = useDispatch.withTypes<AppDispatch>()` in `app/hooks.ts`. Components
   never import the untyped hooks.
4. **Slices.** `createSlice` with Immer-style "mutating" reducers. `extraReducers` takes the
   builder callback only; the object form was removed in RTK 2. Co-locate simple selectors
   with the `selectors` field and read them via `cartSlice.selectors.selectTotal`.
5. **Server data goes in RTK Query, not in slices.** One `createApi` per backend, with
   `injectEndpoints` for feature files. Reads `providesTags`, writes `invalidatesTags`:

   ```ts
   getTodos: b.query<Todo[], void>({
     query: () => '/todos',
     providesTags: (r) => [...(r ?? []).map(({ id }) => ({ type: 'Todo' as const, id })), { type: 'Todo', id: 'LIST' }],
   }),
   addTodo: b.mutation<Todo, NewTodo>({
     query: (body) => ({ url: '/todos', method: 'POST', body }),
     invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
   }),
   ```

   Use `createAsyncThunk` only for work that is not a cached request: a multi-step flow, a
   write to IndexedDB, something that must update several slices.

6. **Optimistic updates** in `onQueryStarted`: patch the cache, undo on failure.

   ```ts
   async onQueryStarted({ id, done }, { dispatch, queryFulfilled }) {
     const patch = dispatch(api.util.updateQueryData('getTodos', undefined, (draft) => {
       const t = draft.find((x) => x.id === id);
       if (t) t.done = done;
     }));
     try { await queryFulfilled; } catch { patch.undo(); }
   },
   ```

7. **Normalised collections** with `createEntityAdapter`: `adapter.getInitialState()`,
   `adapter.upsertMany` in reducers, `adapter.getSelectors((s: RootState) => s.items)`.
8. **Derived data with `createSelector`.** Any selector that returns a new array or object
   (`filter`, `map`, spreading) must be memoised, or every dispatch re-renders its readers.
   RTK 2 warns in development when an input selector returns a new reference.
9. **Side effects in the listener middleware**, not in components: create it with
   `createListenerMiddleware()`, type it with `listener.startListening.withTypes<RootState,
AppDispatch>()`, and match with `actionCreator`, `matcher` or `predicate`. Use
   `cancelActiveListeners()` plus `delay()` for debounce.
10. **Verify** with the `rx-verify` skill: typecheck, lint, tests.

## Testing

- Test reducers as plain functions: `reducer(state, action)` against the expected state.
- Test components with a real store: a `renderWithStore(ui, { preloadedState })` helper that
  calls `makeStore` and wraps in `<Provider>`. Assert on the screen, not on dispatched actions.
- Mock the network with MSW, not the RTK Query hooks (see `rx-fe-testing`).
- Reset RTK Query between tests by making a new store per test.

## Migrating legacy Redux

1. Replace `createStore` with `configureStore`; it adds thunk and dev checks. Fix any
   mutation or non-serialisable warnings it reports; they were bugs already.
2. Convert one reducer at a time to `createSlice`, keeping action type strings if other code
   listens for them.
3. Move fetch-and-store thunks to RTK Query endpoints and delete their loading flags.
4. Replace `connect()` with the typed hooks as components are touched, not in one sweep.

## Rules

- Never put non-serialisable values (class instances, Promises, DOM nodes) in state.
- Never copy RTK Query data into a slice; read it with the query hook or `select`.
- Keep state minimal; compute totals and filters in selectors.
- One `createApi` per base URL. Several APIs means several caches that cannot invalidate
  each other.
- With the React Compiler on, selectors still need memoising; the compiler does not see
  through `useSelector`.

## Example

A feature adds "mark all done": an RTK Query mutation `markAllDone` with
`invalidatesTags: [{ type: 'Todo', id: 'LIST' }]`, a `useMarkAllDoneMutation` call in the
toolbar that disables the button while `isLoading`, and a test that renders the list with a
fresh store, stubs `POST /todos/done` and `GET /todos` with MSW, clicks the button and
awaits `findAllByRole('checkbox', { checked: true })`.
