---
name: rx-fe-code-splitting
description: Splits a React bundle by route and by heavy feature with React.lazy, Suspense, dynamic import, Next.js dynamic and bundler chunk options, preloads on intent, recovers from chunk load failures after a deploy, and measures with a bundle analyzer against a budget. Use when the first load is slow, the main bundle keeps growing, or users see errors after a release.
---

# rx-fe-code-splitting

Ship the code for the screen the user is on, load the rest when they are about to need it,
and measure the result. Splitting blind moves bytes around without making anything faster.

## When to use

- The initial JavaScript is large, or LCP and INP are poor on a mid-range phone.
- A heavy library (charts, editor, maps, PDF, syntax highlighting) is in the main bundle but
  used on one screen.
- Users report a blank screen or "Failed to fetch dynamically imported module" after deploys.

## Steps

1. **Measure first.** Build for production and look at what is in each chunk:
   - Vite: `npx vite-bundle-visualizer`, or `rollup-plugin-visualizer` in the config.
   - Next.js: `@next/bundle-analyzer` with `ANALYZE=true npm run build` (newer Next versions
     also ship `next experimental-analyze`; check your version).
   - webpack: `webpack-bundle-analyzer`. Any bundle: `npx source-map-explorer dist/**/*.js`.
     Write down the gzip size of the entry chunk; that is the number to move.
2. **Split by route.** Most wins are here.
   - Next.js App Router splits per route already; do nothing.
   - React Router 7 (data mode): use the route `lazy` property; Framework mode splits for you.
   - TanStack Router: enable `autoCodeSplitting` in the plugin.
   - Plain SPA: `React.lazy` per page under one `<Suspense>` in the layout.
3. **Split heavy features inside a route** with `lazy` or `next/dynamic`:

   ```tsx
   const Chart = lazy(() => import("@/features/report/chart"));
   // Next.js, client-only widget
   const Map = dynamic(() => import("@/features/map/map"), {
     ssr: false,
     loading: () => <MapSkeleton />,
   });
   ```

   `lazy` needs a default export; for a named one use
   `lazy(() => import('./chart').then((m) => ({ default: m.Chart })))`.

4. **Load libraries on demand** inside handlers: `const { jsPDF } = await import('jspdf')`.
   Also check for smaller imports (`date-fns/format` over a barrel, `lodash-es` per function)
   and drop libraries the platform replaces (`Intl`, `structuredClone`, `fetch`).
5. **Preload on intent** so the split costs no visible wait. Keep the import in a function
   and call it on hover, focus or when the route is likely next:

   ```tsx
   const loadSettings = () => import("@/pages/settings");
   const Settings = lazy(loadSettings);
   <Link to="/settings" onMouseEnter={loadSettings} onFocus={loadSettings}>
     Settings
   </Link>;
   ```

   Next.js `<Link>` and TanStack Router (`defaultPreload: 'intent'`) do this already.

6. **Group vendor code deliberately** only when the analyzer shows duplication or a huge
   shared chunk. Rollup-based Vite: `build.rollupOptions.output.manualChunks`. Vite on
   Rolldown has its own chunking options, so check the Vite version and vite.dev before
   copying config. Do not hand-split everything; it defeats HTTP caching and preloading.
7. **Handle chunk load failures.** After a deploy, open tabs request chunk hashes that no
   longer exist. Wrap lazy areas in an error boundary with a reload action, and in Vite
   listen for the preload error once:

   ```ts
   window.addEventListener("vite:preloadError", (e) => {
     if (sessionStorage.getItem("reloaded-for-chunk")) return;
     e.preventDefault();
     sessionStorage.setItem("reloaded-for-chunk", "1");
     window.location.reload();
   });
   ```

   Also keep the previous deploy's assets available for a while if the host allows it.

8. **Set a budget and enforce it.** Record the entry size in the PR, and add `size-limit` or
   the bundler's size warning to CI so growth is a failing check, not a surprise.

## Rules

- Every `lazy` component sits under a `<Suspense>` with a fallback the size of the real
  content (a skeleton), so the layout does not jump (CLS).
- Declare `lazy` at module level, never inside a component; otherwise it remounts and
  refetches on every render.
- Do not split tiny components; each chunk costs a request. Split at around 30 kB gzip or a
  whole route.
- Do not lazy-load what is above the fold on the landing route; it delays LCP.
- Keep the split behind one Suspense boundary per region, not one per widget, to avoid
  popcorn loading.
- Server Components already keep their dependencies out of the client bundle; move a heavy
  formatter to the server before splitting it on the client.

## Example

The dashboard entry chunk is 410 kB gzip. The analyzer shows `echarts` (320 kB) used only
by `/reports`. Make `ReportsPage` lazy, preload it from the nav link on hover, give the
route an error boundary with "A new version is available. Reload", and add a
`size-limit` entry of 120 kB for the entry chunk. Rebuild: entry 92 kB, reports chunk
325 kB loaded on intent. Confirm in the Network panel that `/` no longer requests it, and
run the `rx-fe-performance` skill to check LCP on a throttled profile.
